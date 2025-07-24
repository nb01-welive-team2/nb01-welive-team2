import { create } from "superstruct";
import { Request, Response } from "express";
import { USER_ROLE } from "@prisma/client";
import { EventIdParamStruct, UpdateEventStruct } from "../structs/eventStructs";
import eventService from "../services/eventService";
import { ResponseEventDTO, ResponseEventListDTO } from "../dto/eventDTO";
import removeSuccessMessage from "../lib/responseJson/removeSuccess";
import { AuthenticatedRequest } from "@/types/express";
import ForbiddenError from "@/errors/ForbiddenError";
import { GetEventStruct } from "@/structs/eventStructs";

/**
 * @openapi
 * /api/event:
 *   get:
 *     summary: 이벤트 목록 조회 [관리자/입주민]
 *     description: 아파트 단지별로 특정 연도와 월에 해당하는 이벤트 목록을 조회합니다. SUPER_ADMIN 권한 사용자는 접근할 수 없습니다
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: apartmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 2149430f-2892-463f-b3e7-4e893548c6d6
 *         description: 조회할 아파트 단지 ID
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2026
 *         description: 조회할 연도 네 자리 숫자
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           example: 5
 *         description: 조회할 월 1에서 12 사이 값
 *     responses:
 *       200:
 *         description: 이벤트 목록이 성공적으로 반환되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     description: 이벤트 ID
 *                   start:
 *                     type: string
 *                     format: date-time
 *                     description: 이벤트 시작일
 *                   end:
 *                     type: string
 *                     format: date-time
 *                     description: 이벤트 종료일
 *                   title:
 *                     type: string
 *                     description: 이벤트 제목
 *                   category:
 *                     type: string
 *                     description: 이벤트 카테고리 공지사항 또는 투표
 *                     example: MAINTENANCE
 *                   type:
 *                     type: string
 *                     description: 이벤트 타입 NOTICE 또는 POLL
 *                     example: NOTICE
 *       400:
 *         description: 잘못된 요청입니다. 유효하지 않은 연도 또는 월 값입니다
 *       403:
 *         description: 권한이 없거나 다른 아파트 ID를 요청했습니다
 *       500:
 *         description: 서버 오류가 발생했습니다
 */
export async function getEventList(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const data = create(req.query, GetEventStruct);
  if (data.apartmentId !== reqWithPayload.user.apartmentId) {
    throw new ForbiddenError();
  }
  const result = await eventService.getEventList(data);
  res.send(ResponseEventListDTO(result));
}

/**
 * @openapi
 * /api/event:
 *   put:
 *     summary: 이벤트 정보 수정 [관리자]
 *     description: 관리자가 특정 게시물의 이벤트 기간을 수정합니다. 이벤트가 없으면 새로 등록합니다
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: boardType
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - NOTICE
 *             - POLL
 *           example: NOTICE
 *         description: 이벤트와 연결된 게시판 타입 NOTICE 또는 POLL
 *       - in: query
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: f1c531ea-8f03-4f12-a8bb-7899148354df
 *         description: 연결된 게시물 ID
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2025-07-22T09:00:00Z
 *         description: 이벤트 시작일
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2025-07-25T18:00:00Z
 *         description: 이벤트 종료일
 *     responses:
 *       200:
 *         description: 이벤트 정보가 성공적으로 수정되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseEventDTO'
 *       400:
 *         description: 잘못된 요청입니다. 필수 필드가 누락되었거나 형식이 잘못되었습니다
 *       401:
 *         description: 관리자 권한이 없는 사용자입니다
 *       500:
 *         description: 서버 오류가 발생했습니다
 */
export async function editEvent(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const data = create(req.query, UpdateEventStruct);
  const event = await eventService.editEvent(data, reqWithPayload.user.userId);
  res.status(200).send(new ResponseEventDTO(event));
}

/**
 * @openapi
 * /api/event/{eventId}:
 *   delete:
 *     summary: 이벤트 삭제 [관리자]
 *     description: 관리자가 특정 이벤트를 삭제합니다
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 3f8d3f9e-5b6a-4c4e-8a3b-1c7a7e5e7c2f
 *         description: 삭제할 이벤트의 ID
 *     responses:
 *       200:
 *         description: 이벤트가 성공적으로 삭제되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 정상적으로 삭제 처리되었습니다
 *       401:
 *         description: 관리자 권한이 없는 사용자입니다
 *       404:
 *         description: 이벤트를 찾을 수 없습니다
 *       500:
 *         description: 서버 오류가 발생했습니다
 */
export async function removeEvent(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const { eventId } = create(req.params, EventIdParamStruct);
  await eventService.removeEvent(eventId, reqWithPayload.user.userId);
  res.status(200).send(new removeSuccessMessage());
}
