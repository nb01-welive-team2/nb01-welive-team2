import { Request, Response } from "express";
import * as pollService from "../services/pollService";
import { getPagination } from "../utils/pagination";
import UnauthError from "../errors/UnauthError";
import ForbiddenError from "../errors/ForbiddenError";
import { createPollSchema, pollIdParamSchema } from "../structs/pollStructs";
import { validate } from "superstruct";
import { USER_ROLE } from "@prisma/client";
import { AuthenticatedRequest } from "@/types/express";
import registerSuccessMessage from "@/lib/responseJson/registerSuccess";

// 투표 등록
export const createPoll = async (req: Request, res: Response) => {
  const reqWithPayload = req as AuthenticatedRequest;
  const userId = reqWithPayload.user?.userId;
  const role = reqWithPayload.user?.role;

  if (!userId || !role) throw new UnauthError();
  if (role !== USER_ROLE.ADMIN) throw new ForbiddenError();

  validate(req.body, createPollSchema);
  await pollService.createPoll(
    req.body,
    userId,
    reqWithPayload.user.apartmentId
  );
  res.status(201).send(new registerSuccessMessage());
};

// 투표 전체 조회
export const getPollList = async (req: Request, res: Response) => {
  const reqWithPayload = req as AuthenticatedRequest;
  const { page, limit } = getPagination({
    page: req.query.page as string,
    limit: req.query.limit as string,
  });

  const keyword = req.query.keyword as string;
  const status = req.query.status as string;
  const userId = reqWithPayload.user.userId;
  const role = reqWithPayload.user.role;

  const polls = await pollService.getPollList({
    page,
    limit,
    keyword,
    status,
    userId,
    role,
  });

  res.status(200).json({ polls });
};

// 투표 상세 조회
export const getPoll = async (req: Request, res: Response) => {
  const reqWithPayload = req as AuthenticatedRequest;
  const pollId = req.params.pollId;
  const userId = reqWithPayload.user.userId;
  res.status(200).json(await pollService.getPoll(pollId, userId));
};

// 투표 수정
export const editPoll = async (req: Request, res: Response) => {
  const reqWithPayload = req as AuthenticatedRequest;
  if (!reqWithPayload.user?.userId || !reqWithPayload.user?.role) {
    throw new UnauthError();
  }
  const userId = reqWithPayload.user.userId;
  const role = reqWithPayload.user.role;

  validate(req.body, createPollSchema);
  res
    .status(200)
    .json(
      await pollService.editPoll(req.params.pollId, req.body, userId, role)
    );
};

// 투표 삭제
export const removePoll = async (req: Request, res: Response) => {
  const reqWithPayload = req as AuthenticatedRequest;
  if (!reqWithPayload.user?.userId || !reqWithPayload.user?.role) {
    throw new UnauthError();
  }
  const userId = reqWithPayload.user.userId;
  const role = reqWithPayload.user.role;

  validate({ pollId: req.params.pollId }, pollIdParamSchema);
  await pollService.removePoll(req.params.pollId, userId, role);
  res.status(204).send();
};
