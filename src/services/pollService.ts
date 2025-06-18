import { Prisma } from "@prisma/client";
import {
  CreatePollRequestDto,
  PollResponseDto,
  PollDetailResponseDto,
  GetPollListParams,
} from "../dto/pollDto";
import * as pollRepo from "../repositories/pollRepository";
import { getPagination } from "../utils/pagination";
import NotFoundError from "../errors/NotFoundError";
import ForbiddenError from "../errors/ForbiddenError";

const toISO = (d: Date) => d.toISOString();

const mapToPollResponse = (poll: any): PollResponseDto => ({
  id: poll.id,
  title: poll.title,
  author: poll.user.name,
  status: poll.status,
  buildingPermission: poll.buildingPermission,
  description: poll.content,
  startDate: toISO(poll.startDate),
  endDate: toISO(poll.endDate),
  options: poll.pollOptions.map((opt: any) => opt.content),
});

// 투표 등록
export const createPoll = async (
  dto: CreatePollRequestDto,
  userId: string
): Promise<PollResponseDto> => {
  const poll = await pollRepo.createPollEntry({
    articleId: dto.articleId,
    title: dto.title,
    description: dto.description,
    startDate: new Date(dto.startDate),
    endDate: new Date(dto.endDate),
    buildingPermission: dto.buildingPermission,
    userId,
  });

  await pollRepo.createPollOptions(poll.id, dto.options);

  return {
    id: poll.id,
    title: poll.title,
    author: poll.user.name,
    description: poll.content,
    startDate: toISO(poll.startDate),
    endDate: toISO(poll.endDate),
    options: dto.options,
    status: poll.status,
    buildingPermission: poll.buildingPermission,
  };
};

// 투표 전체 조회
export const getPollList = async (
  params: GetPollListParams
): Promise<PollResponseDto[]> => {
  const { page, limit, keyword, status, userId, role } = params;
  const { skip, take } = getPagination({ page, limit });

  const where: any = {
    ...(status && { status }),
    ...(keyword && {
      title: {
        contains: keyword,
        mode: "insensitive",
      },
    }),
  };

  const isUserRole = role === "USER";
  if (isUserRole && userId) {
    const userDong = await pollRepo.getUserDongNumber(userId);
    if (userDong !== null) {
      where.OR = [{ buildingPermission: 0 }, { buildingPermission: userDong }];
    } else {
      return [];
    }
  }

  const polls = await pollRepo.findPolls(where, skip, take);
  return polls.map(mapToPollResponse);
};

// 투표 상세 조회
export const getPoll = async (
  pollId: string,
  userId?: string
): Promise<PollDetailResponseDto> => {
  const poll = await pollRepo.findPollByIdWithVotes(pollId);
  if (!poll) throw new NotFoundError("Poll", "투표를 찾을 수 없습니다.");

  const apartmentId = await pollRepo.getApartmentIdByPollId(pollId);
  const isEligible =
    apartmentId && userId
      ? await pollRepo.isUserInApartment(userId, apartmentId)
      : false;

  const now = new Date();
  const showResult = now >= poll.endDate;
  const canVote = now >= poll.startDate && now < poll.endDate;

  return {
    id: poll.id,
    title: poll.title,
    description: poll.content,
    startDate: toISO(poll.startDate),
    endDate: toISO(poll.endDate),
    options: poll.pollOptions.map((opt: any) =>
      showResult
        ? { content: opt.content, voteCount: opt.votes.length }
        : { content: opt.content }
    ),
    canVote,
    showResult,
    isEligible,
  };
};

// 투표 수정
export const editPoll = async (
  pollId: string,
  dto: CreatePollRequestDto,
  userId: string,
  role: string
): Promise<PollResponseDto> => {
  const poll = await pollRepo.findPollForEdit(pollId);
  if (!poll) throw new NotFoundError("Poll", "투표를 찾을 수 없습니다.");
  if (poll.userId !== userId && role !== "ADMIN") {
    throw new ForbiddenError("Poll", Number(pollId), Number(userId));
  }
  if (poll.startDate <= new Date()) {
    throw new ForbiddenError("Poll", Number(pollId), Number(userId));
  }

  const updated = await pollRepo.updatePoll(pollId, {
    title: dto.title,
    startDate: new Date(dto.startDate),
    endDate: new Date(dto.endDate),
    buildingPermission: dto.buildingPermission,
    status: dto.status,
  });

  await pollRepo.replacePollOptions(pollId, dto.options);

  return {
    id: updated.id,
    title: updated.title,
    author: updated.user?.name ?? "",
    description: updated.content,
    startDate: toISO(updated.startDate),
    endDate: toISO(updated.endDate),
    options: dto.options,
    status: updated.status,
    buildingPermission: updated.buildingPermission,
  };
};

// 투표 삭제
export const removePoll = async (pollId: string, userId: string) => {
  const poll = await pollRepo.findPollWithAuthor(pollId);
  if (!poll) throw new NotFoundError("Poll", "해당 투표를 찾을 수 없습니다.");
  if (poll.userId !== userId) {
    throw new ForbiddenError("Poll", Number(pollId), Number(userId));
  }
  if (poll.startDate <= new Date()) {
    throw new ForbiddenError("Poll", Number(pollId), Number(userId));
  }
  await pollRepo.deletePollById(pollId);
};
