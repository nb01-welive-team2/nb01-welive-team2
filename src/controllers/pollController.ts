import { Request, Response } from "express";
import * as pollService from "../services/pollService";
import { getPagination } from "../utils/pagination";
import AccessDeniedError from "../errors/AccessDeniedError";
import UnauthError from "../errors/UnauthError";
import { createPollSchema, pollIdParamSchema } from "../structs/pollStructs";
import { validate } from "superstruct";

// 투표 등록
export const createPoll = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!userId || !role) throw new UnauthError();
  if (role !== "ADMIN")
    throw new AccessDeniedError("투표는 관리자만 생성할 수 있습니다.");

  validate(req.body, createPollSchema);
  res.status(201).json(await pollService.createPoll(req.body, userId));
};

// 투표 전체 조회
export const getPollList = async (req: Request, res: Response) => {
  const { page, limit } = getPagination({
    page: req.query.page as string,
    limit: req.query.limit as string,
  });

  const keyword = req.query.keyword as string;
  const status = req.query.status as string;
  const userId = req.user?.id;
  const role = req.user?.role;

  res.status(200).json(
    await pollService.getPollList({
      page,
      limit,
      keyword,
      status,
      userId,
      role,
    })
  );
};

// 투표 상세 조회
export const getPoll = async (req: Request, res: Response) => {
  const pollId = req.params.pollId;
  const userId = req.user?.id;
  res.status(200).json(await pollService.getPoll(pollId, userId));
};

// 투표 수정
export const editPoll = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  if (!userId || !role) throw new UnauthError();

  validate(req.body, createPollSchema);
  res
    .status(200)
    .json(
      await pollService.editPoll(req.params.pollId, req.body, userId, role)
    );
};

// 투표 삭제
export const removePoll = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthError();

  validate({ pollId: req.params.pollId }, pollIdParamSchema);
  await pollService.removePoll(req.params.pollId, userId);
  res.status(204).send();
};
