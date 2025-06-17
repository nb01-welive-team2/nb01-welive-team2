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
  title: poll.article.title,
  author: poll.article.user.name,
  status: poll.status,
  buildingPermission: poll.buildingPermission,
  description: poll.article.content,
  startDate: toISO(poll.article.startDate),
  endDate: toISO(poll.article.endDate),
  options: poll.pollOptions.map((opt: any) => opt.content),
  createdAt: toISO(poll.article.createdAt),
  updatedAt: toISO(poll.article.updatedAt),
});

// 투표 등록
export const createPoll = async (
  dto: CreatePollRequestDto,
  userId: string
): Promise<PollResponseDto> => {
  const article = await pollRepo.createPollArticle({
    title: dto.title,
    content: dto.description || "",
    startDate: new Date(dto.startDate),
    endDate: new Date(dto.endDate),
    boardId: "POLL",
    userId,
  });

  const poll = await pollRepo.createPollEntry(
    article.id,
    dto.buildingPermission
  );
  await pollRepo.createPollOptions(poll.id, dto.options);

  return {
    id: poll.id,
    title: article.title,
    description: article.content,
    startDate: toISO(article.startDate),
    endDate: toISO(article.endDate),
    options: dto.options,
    createdAt: toISO(article.startDate),
    updatedAt: toISO(article.endDate),
    status: poll.status,
  };
};

export const getPollList = async (
  params: GetPollListParams
): Promise<PollResponseDto[]> => {
  const { page, limit, keyword, status, userId, role } = params;
  const { skip, take } = getPagination({ page, limit });

  const where: any = {
    ...(status && { status }),
    article: {
      ...(keyword && {
        title: {
          contains: keyword,
          mode: "insensitive",
        },
      }),
    },
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

export const getPoll = async (
  pollId: string,
  userId?: string
): Promise<PollDetailResponseDto> => {
  const poll = await pollRepo.findPollById(pollId);
  if (!poll) throw new NotFoundError("Poll", "투표를 찾을 수 없습니다.");

  const apartmentId = await pollRepo.getApartmentIdByPollId(pollId);
  const isEligible =
    apartmentId && userId
      ? await pollRepo.isUserInApartment(userId, apartmentId)
      : false;

  const now = new Date();
  const showResult = now >= poll.article.endDate;
  const canVote = now >= poll.article.startDate && now < poll.article.endDate;

  return {
    id: poll.id,
    title: poll.article.title,
    description: poll.article.content,
    startDate: toISO(poll.article.startDate),
    endDate: toISO(poll.article.endDate),
    options: poll.pollOptions.map((opt: any) =>
      showResult
        ? { content: opt.content, voteCount: opt.votes.length }
        : { content: opt.content }
    ),
    createdAt: toISO(poll.article.createdAt),
    updatedAt: toISO(poll.article.updatedAt),
    canVote,
    showResult,
    isEligible,
  };
};

export const editPoll = async (
  pollId: string,
  dto: CreatePollRequestDto,
  userId: string,
  role: string
): Promise<PollResponseDto> => {
  const poll = await pollRepo.findPollForEdit(pollId);
  if (!poll) throw new NotFoundError("Poll", "투표를 찾을 수 없습니다.");
  if (poll.article.userId !== userId && role !== "ADMIN") {
    throw new ForbiddenError("Poll", Number(pollId), Number(userId));
  }
  if (poll.article.startDate <= new Date()) {
    throw new ForbiddenError("Poll", Number(pollId), Number(userId));
  }

  const updated = await pollRepo.updatePollAndArticle(pollId, {
    title: dto.title,
    description: dto.description,
    startDate: new Date(dto.startDate),
    endDate: new Date(dto.endDate),
    buildingPermission: dto.buildingPermission,
    status: dto.status,
  });

  await pollRepo.replacePollOptions(pollId, dto.options);

  return {
    id: updated.id,
    title: updated.article.title,
    author: "",
    description: updated.article.content,
    startDate: toISO(updated.article.startDate),
    endDate: toISO(updated.article.endDate),
    options: dto.options,
    createdAt: toISO(updated.article.createdAt),
    updatedAt: toISO(updated.article.updatedAt),
    status: updated.status,
    buildingPermission: updated.buildingPermission,
  };
};

export const removePoll = async (pollId: string, userId: string) => {
  const poll = await pollRepo.findPollWithAuthor(pollId);
  if (!poll) throw new NotFoundError("Poll", "해당 투표를 찾을 수 없습니다.");
  if (poll.article.userId !== userId) {
    throw new ForbiddenError("Poll", Number(pollId), Number(userId));
  }
  if (poll.article.startDate <= new Date()) {
    throw new ForbiddenError("Poll", Number(pollId), Number(userId));
  }

  await pollRepo.deletePollById(pollId);
};
