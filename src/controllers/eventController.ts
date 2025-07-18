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
 * /events:
 *   get:
 *     summary: 공지사항 목록 조회
 *     description: 사용자 권한에 따라 공지사항 목록을 페이지 단위로 조회합니다.
 *                  SUPER_ADMIN 권한 사용자는 접근이 제한됩니다.
 *     tags:
 *       - Events
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호 기본값 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 11
 *         description: 페이지 크기 기본값 11
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 공지사항 목록이 성공적으로 반환되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseEventListDTO'
 *       401:
 *         description: 권한이 없는 사용자입니다.
 *       400:
 *         description: 잘못된 요청입니다. 유효하지 않은 페이지 번호 또는 페이지 크기일 수 있습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
export async function getEventList(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  if ((reqWithPayload.user.role as string) === USER_ROLE.SUPER_ADMIN) {
    throw new ForbiddenError();
  }
  const data = create(req.query, GetEventStruct);
  if (data.apartmentId !== reqWithPayload.user.apartmentId) {
    throw new ForbiddenError();
  }
  const result = await eventService.getEventList(data);
  res.send(ResponseEventListDTO(result));
}

/**
 * @openapi
 * /companies/{companyId}:
 *   patch:
 *     summary: 회사 정보 수정
 *     description: 지정된 회사의 정보를 수정합니다. 관리자의 권한을 가진 사용자만 접근할 수 있습니다.
 *     tags:
 *       - Company
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 회사 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: 수정할 회사 이름
 *                 example: 햇살카 수정
 *               companyCode:
 *                 type: string
 *                 description: 수정할 회사 코드
 *                 example: HS-001
 *     responses:
 *       200:
 *         description: 회사 정보가 성공적으로 수정되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseCompanyDTO'
 *       400:
 *         description: 잘못된 요청입니다. 필수 필드가 누락되었거나 잘못된 형식일 수 있습니다.
 *       401:
 *         description: 관리자 권한이 없는 사용자입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
export async function editEvent(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  if (reqWithPayload.user.role !== USER_ROLE.ADMIN) {
    throw new ForbiddenError();
  }
  const data = create(req.query, UpdateEventStruct);
  const event = await eventService.editEvent(data);
  res.status(200).send(new ResponseEventDTO(event));
}

/**
 * @openapi
 * /companies/{companyId}:
 *   delete:
 *     summary: 회사 삭제
 *     description: 지정된 회사의 정보를 삭제합니다. 관리자의 권한을 가진 사용자만 접근할 수 있습니다.
 *     tags:
 *       - Company
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 회사 ID
 *     responses:
 *       200:
 *         description: 회사가 성공적으로 삭제되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "회사 삭제 성공"
 *       401:
 *         description: 관리자 권한이 없는 사용자입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
export async function removeEvent(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  if (reqWithPayload.user.role !== USER_ROLE.ADMIN) {
    throw new ForbiddenError();
  }
  const { eventId } = create(req.params, EventIdParamStruct);
  await eventService.removeEvent(eventId);
  res.status(200).send(new removeSuccessMessage());
}
