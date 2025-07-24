import { create } from "superstruct";
import { Request, Response } from "express";
import { USER_ROLE } from "@prisma/client";
import {
  CreateNoticeBodyStruct,
  NoticeIdParamStruct,
  NoticePageParamsStruct,
  PatchNoticeBodyStruct,
} from "../structs/noticeStructs";
import noticeService from "../services/noticeService";
import registerSuccessMessage from "../lib/responseJson/registerSuccess";
import {
  ResponseNoticeCommentDTO,
  ResponseNoticeDTO,
  ResponseNoticeListDTO,
} from "../dto/noticeDTO";
import removeSuccessMessage from "../lib/responseJson/removeSuccess";
import { AuthenticatedRequest } from "@/types/express";
import ForbiddenError from "@/errors/ForbiddenError";

/**
 * @openapi
 * /api/notices:
 *   post:
 *     summary: 공지사항 생성 [관리자]
 *     description: 관리자가 공지 카테고리, 제목, 내용, 상단 고정 여부 및 선택적으로 이벤트 기간을 입력하여 새로운 공지사항을 생성합니다.
 *     tags:
 *       - Notices
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - title
 *               - isPinned
 *             properties:
 *               category:
 *                 type: string
 *                 description: 공지 카테고리
 *                 example: "MAINTENANCE"
 *               title:
 *                 type: string
 *                 description: 공지사항 제목
 *                 example: "서비스 점검 안내"
 *               content:
 *                 type: string
 *                 description: 공지사항 내용
 *                 example: "2025년 6월 20일 02:00 ~ 04:00 시스템 점검이 예정되어 있습니다."
 *               isPinned:
 *                 type: boolean
 *                 description: 상단 고정 여부
 *                 example: true
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: 이벤트 시작 날짜 선택
 *                 example: "2025-06-20T02:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: 이벤트 종료 날짜 선택
 *                 example: "2025-06-20T04:00:00Z"
 *     responses:
 *       201:
 *         description: 공지사항 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 정상적으로 등록 처리되었습니다.
 *       400:
 *         description: 잘못된 요청. 입력 데이터가 유효하지 않습니다.
 *       401:
 *         description: 인증되지 않음. 관리자만 공지사항을 생성할 수 있습니다.
 */
export async function createNotice(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const data = create(req.body, CreateNoticeBodyStruct);
  const isEvent = Boolean(data.startDate && data.endDate);

  await noticeService.createNotice(
    data,
    reqWithPayload.user.userId,
    reqWithPayload.user.apartmentId,
    isEvent
  );

  res.status(201).send(new registerSuccessMessage());
}

/**
 * @openapi
 * /api/notices:
 *   get:
 *     summary: 공지사항 목록 조회 [관리자/입주민]
 *     description: 사용자 권한에 따라 공지사항 목록을 페이지 단위로 조회합니다. SUPER_ADMIN 권한 사용자는 접근이 제한됩니다.
 *     tags:
 *       - Notices
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           example: 1
 *         description: 페이지 번호 기본값 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 11
 *           example: 11
 *         description: 페이지 크기 기본값 11
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [MAINTENANCE, EMERGENCY, COMMUNITY, RESIDENT_VOTE, RESIDENT_COUNCIL, ETC]  # 실제 NoticeCategoryEnum에 맞게 나열
 *         description: 공지 카테고리 필터링 선택 사항
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 검색 키워드 선택 사항
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 공지사항 목록이 성공적으로 반환되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseNoticeListDTO'
 *       403:
 *         description: 권한이 없는 사용자입니다.
 *       400:
 *         description: 잘못된 요청입니다. 유효하지 않은 페이지 번호 또는 페이지 크기일 수 있습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
export async function getNoticeList(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const data = create(req.query, NoticePageParamsStruct);
  const result = await noticeService.getNoticeList(
    reqWithPayload.user.apartmentId,
    data
  );
  res.send(new ResponseNoticeListDTO(result));
}

/**
 * @openapi
 * /api/notices/{noticeId}:
 *   get:
 *     summary: 공지사항 상세 조회 [관리자/입주민]
 *     description: SUPER_ADMIN 권한 사용자는 접근이 제한됩니다. 특정 공지사항 ID에 해당하는 상세 정보를 반환합니다.
 *     tags:
 *       - Notices
 *     parameters:
 *       - in: path
 *         name: noticeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: f1c531ea-8f03-4f12-a8bb-7899148354df
 *         description: 조회할 공지사항 ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 공지사항 상세 정보가 성공적으로 반환되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseNoticeCommentDTO'
 *       403:
 *         description: 권한이 없는 사용자입니다.
 *       404:
 *         description: 해당 공지사항을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
export async function getNotice(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const { noticeId } = create(req.params, NoticeIdParamStruct);
  const result = await noticeService.getNotice(
    noticeId,
    reqWithPayload.user.userId,
    reqWithPayload.user.role as USER_ROLE
  );
  res.send(new ResponseNoticeCommentDTO(result));
}

/**
 * @openapi
 * /api/notices/{noticeId}:
 *   put:
 *     summary: 공지사항 정보 수정 [관리자]
 *     description: 지정된 공지사항 정보를 수정합니다. ADMIN 권한을 가진 사용자만 접근할 수 있습니다.
 *     tags:
 *       - Notices
 *     parameters:
 *       - in: path
 *         name: noticeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: f1c531ea-8f03-4f12-a8bb-7899148354df
 *         description: 수정할 공지사항 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: 공지 카테고리
 *                 example: MAINTENANCE
 *               title:
 *                 type: string
 *                 description: 공지사항 제목
 *                 example: 서비스 점검 안내 수정
 *               content:
 *                 type: string
 *                 description: 공지사항 내용
 *                 example: 2025년 6월 20일 02:00 ~ 07:00 시스템 점검이 예정되어 있습니다.
 *               isPinned:
 *                 type: boolean
 *                 description: 상단 고정 여부
 *                 example: true
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: 이벤트 시작일 선택사항
 *                 example: 2025-06-20T02:00:00Z
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: 이벤트 종료일 선택사항
 *                 example: 2025-06-20T07:00:00Z
 *     responses:
 *       200:
 *         description: 공지사항 정보가 성공적으로 수정되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseNoticeDTO'
 *       400:
 *         description: 잘못된 요청입니다. 필수 필드가 누락되었거나 형식이 올바르지 않습니다.
 *       403:
 *         description: 관리자 권한이 없는 사용자입니다.
 *       404:
 *         description: 수정할 공지사항을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
export async function editNotice(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const data = create(req.body, PatchNoticeBodyStruct);
  const { noticeId } = create(req.params, NoticeIdParamStruct);
  const isEvent = Boolean(data.startDate && data.endDate);
  const notice = await noticeService.updateNotice(noticeId, data, isEvent);
  res.status(200).send(new ResponseNoticeDTO(notice));
}

/**
 * @openapi
 * /api/notices/{noticeId}:
 *   delete:
 *     summary: 공지사항 삭제 [관리자]
 *     description: 지정된 공지사항을 삭제합니다. ADMIN 권한을 가진 사용자만 접근할 수 있습니다.
 *     tags:
 *       - Notices
 *     parameters:
 *       - in: path
 *         name: noticeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: f1c531ea-8f03-4f12-a8bb-7899148354df
 *         description: 삭제할 공지사항 ID
 *     responses:
 *       200:
 *         description: 공지사항이 성공적으로 삭제되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 공지사항 삭제 성공
 *       403:
 *         description: 관리자 권한이 없는 사용자입니다.
 *       404:
 *         description: 삭제할 공지사항을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
export async function removeNotice(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const { noticeId } = create(req.params, NoticeIdParamStruct);
  await noticeService.removeNotice(noticeId);
  res.status(200).send(new removeSuccessMessage());
}
