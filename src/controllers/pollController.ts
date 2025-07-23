import { Request, Response } from "express";
import * as pollService from "../services/pollService";
import { getPagination } from "../utils/pagination";
import UnauthError from "../errors/UnauthError";
import ForbiddenError from "../errors/ForbiddenError";
import { createPollSchema, pollIdParamSchema } from "../structs/pollStructs";
import { create, validate } from "superstruct";
import { USER_ROLE } from "@prisma/client";
import { AuthenticatedRequest } from "@/types/express";
import registerSuccessMessage from "@/lib/responseJson/registerSuccess";

/**
 * @openapi
 * /api/polls:
 *   post:
 *     summary: 투표 생성
 *     description: 관리자가 투표 제목, 설명, 기간, 옵션 등을 입력하여 새로운 투표를 생성합니다.
 *     tags:
 *       - Polls
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 투표 제목
 *                 example: "놀이터 위치 투표"
 *               content:
 *                 type: string
 *                 description: 투표 설명
 *                 example: "어느 위치에 놀이터를 설치할지 투표해주세요."
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-20T00:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-27T00:00:00Z"
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "A동 옆"
 *               buildingPermission:
 *                 type: number
 *                 example: 0
 *     responses:
 *       201:
 *         description: 투표 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 정상적으로 등록 처리되었습니다.
 *       401:
 *         description: 인증되지 않음
 *       403:
 *         description: 관리자만 생성할 수 있습니다.
 */
export const createPoll = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const { userId, role, apartmentId } = user;

  const body = create(req.body, createPollSchema);
  await pollService.createPoll(body, userId, apartmentId);
  res.status(201).send(new registerSuccessMessage());
};

/**
 * @openapi
 * /api/polls:
 *   get:
 *     summary: 투표 목록 조회
 *     description: 전체 투표 목록을 조회합니다. 권한에 따라 필터링됩니다.
 *     tags:
 *       - Polls
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: number
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *         example: 10
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: 투표 목록 조회 성공
 */
export const getPollList = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const { userId, role } = user;

  const { page, limit } = getPagination({
    page: req.query.page as string,
    limit: req.query.limit as string,
  });

  const keyword = req.query.keyword as string;
  const status = req.query.status as string;

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

/**
 * @openapi
 * /api/polls/{pollId}:
 *   get:
 *     summary: 투표 상세 조회
 *     description: 투표 ID를 통해 상세 내용을 조회합니다.
 *     tags:
 *       - Polls
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           example: 8b83f903-5ede-476d-86a4-a4e20f9c99ac
 *         description: 조회할 투표 ID
 *     responses:
 *       200:
 *         description: 투표 상세 조회 성공
 *       404:
 *         description: 투표를 찾을 수 없습니다.
 */
export const getPoll = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const { userId } = user;
  const pollId = req.params.pollId;

  res.status(200).json(await pollService.getPoll(pollId, userId));
};

/**
 * @openapi
 * /api/polls/{pollId}:
 *   put:
 *     summary: 투표 수정
 *     description: 관리자가 투표 정보를 수정합니다. 이미 시작된 투표는 수정할 수 없습니다.
 *     tags:
 *       - Polls
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           example: 8b83f903-5ede-476d-86a4-a4e20f9c99ac
 *         description: 수정할 투표 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "수정된 제목"
 *               content:
 *                 type: string
 *                 example: "수정된 설명"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               buildingPermission:
 *                 type: number
 *                 example: 0
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "수정된 옵션"
 *               status:
 *                 type: string
 *                 example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: 투표 수정 성공
 *       403:
 *         description: 권한 없음 또는 이미 시작된 투표는 수정 불가
 */
export const editPoll = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const { userId, role } = user;
  const body = create(req.body, createPollSchema);
  const pollId = req.params.pollId;

  res.status(200).json(await pollService.editPoll(pollId, body, userId, role));
};

/**
 * @openapi
 * /api/polls/{pollId}:
 *   delete:
 *     summary: 투표 삭제
 *     description: 투표 작성자가 투표를 삭제합니다. 시작된 투표는 삭제할 수 없습니다.
 *     tags:
 *       - Polls
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: string
 *           example: 8b83f903-5ede-476d-86a4-a4e20f9c99ac
 *         description: 삭제할 투표 ID
 *     responses:
 *       204:
 *         description: 삭제 성공 (No Content)
 *       403:
 *         description: 권한 없음 또는 이미 시작된 투표는 삭제 불가
 *       404:
 *         description: 투표를 찾을 수 없습니다.
 */
export const removePoll = async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  if (!user) throw new UnauthError();
  const { userId, role } = user;

  validate({ pollId: req.params.pollId }, pollIdParamSchema);
  await pollService.removePoll(req.params.pollId, userId, role);

  res.status(204).send();
};
