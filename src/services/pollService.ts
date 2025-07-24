import {
  CreatePollRequestDto,
  PollResponseDto,
  PollDetailResponseDto,
  GetPollListParams,
  UpdatePollRequestDto,
  PollUpdateResponseDto,
} from "../dto/pollDto";
import * as pollRepo from "../repositories/pollRepository";
import { getPagination } from "../utils/pagination";
import NotFoundError from "../errors/NotFoundError";
import ForbiddenError from "../errors/ForbiddenError";
import { createPollSchema, CreatePollSchemaType } from "../structs/pollStructs";
import { assert } from "superstruct";
import { createEvent, deleteEventById } from "../repositories/pollRepository";
import { POLL_STATUS } from "@prisma/client";
import { cancelPollJobs, schedulePollStatus } from "@/lib/pollScheduler";

const toISO = (d: Date) => d.toISOString();

const mapToPollResponse = (poll: any): PollResponseDto => ({
  boardId: poll.boardId,
  id: poll.id,
  title: poll.title,
  content: poll.content,
  status: poll.status,
  buildingPermission: poll.buildingPermission,
  startDate: toISO(poll.startDate),
  endDate: toISO(poll.endDate),
  options: poll.pollOptions.map((opt: any) => opt.content),
});

// 투표 등록
export const createPoll = async (
  dto: CreatePollSchemaType,
  userId: string,
  apartmentId: string
): Promise<void> => {
  assert(dto, createPollSchema);

  const event = await createEvent({
    eventType: "POLL",
    isActive: true,
  });
  const poll = await pollRepo.createPollEntry({
    title: dto.title,
    content: dto.content || "",
    eventId: event.id,
    startDate: new Date(dto.startDate),
    endDate: new Date(dto.endDate),
    buildingPermission: dto.buildingPermission,
    userId,
    apartmentId: apartmentId,
  });

  await pollRepo.createPollOptions(poll.id, dto.options);

  // 스케줄러에 투표 상태 변경 등록
  schedulePollStatus(poll.id, new Date(dto.startDate), new Date(dto.endDate));
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
    ...(role === "ADMIN" && userId && { userId }),
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

  const apartmentId = await pollRepo.findPollByIdWithVotes(pollId);
  const isEligible =
    apartmentId && userId
      ? await pollRepo.isUserInApartment(userId, poll.apartmentId)
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
    status: poll.status,
  };
};

// 투표 수정
export const editPoll = async (
  pollId: string,
  dto: CreatePollSchemaType,
  userId: string,
  role: string
): Promise<PollUpdateResponseDto> => {
  const poll = await pollRepo.findPollForEdit(pollId);

  if (!poll) throw new NotFoundError("Poll", "투표를 찾을 수 없습니다.");
  if (poll.userId !== userId && role !== "ADMIN") {
    throw new ForbiddenError();
  }
  if (poll.status !== POLL_STATUS.PENDING) {
    throw new ForbiddenError("이미 시작된 투표는 수정할 수 없습니다.");
  }

  const updated = await pollRepo.updatePoll(pollId, {
    title: dto.title,
    content: dto.content!,
    startDate: new Date(dto.startDate),
    endDate: new Date(dto.endDate),
    buildingPermission: dto.buildingPermission,
    status: dto.status as POLL_STATUS,
  });

  await pollRepo.replacePollOptions(pollId, dto.options);

  // 스케줄러에 투표 상태 변경 등록
  schedulePollStatus(poll.id, new Date(dto.startDate), new Date(dto.endDate));

  return {
    id: updated.id,
    title: updated.title,
    content: updated.content,
    startDate: toISO(updated.startDate),
    endDate: toISO(updated.endDate),
    options: dto.options,
    status: updated.status,
    buildingPermission: updated.buildingPermission,
  };
};

// 투표 삭제
export const removePoll = async (
  pollId: string,
  userId: string,
  role: string
) => {
  const poll = await pollRepo.findPollWithAuthor(pollId);
  if (!poll) throw new NotFoundError("Poll", "해당 투표를 찾을 수 없습니다.");
  if (poll.userId !== userId) {
    throw new ForbiddenError();
  }
  if (poll.status !== POLL_STATUS.PENDING) {
    throw new ForbiddenError("이미 시작된 투표는 삭제할 수 없습니다.");
  }

  await pollRepo.deletePollById(pollId);

  if (poll.eventId) {
    await deleteEventById(poll.eventId);
  }

  // 스케줄러 작업 취소
  cancelPollJobs(pollId);
};
