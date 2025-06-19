import { create } from "superstruct";
import { Request, Response } from "express";
import { USER_ROLE } from "@prisma/client";
import {
  CreateNoticeBodyStruct,
  NoticeIdParamStruct,
  PatchNoticeBodyStruct,
} from "../structs/noticeStructs";
import noticeService from "../services/noticeService";
import registerSuccessMessage from "../lib/responseJson/registerSuccess";
import { PageParamsStruct } from "../structs/commonStructs";
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
 * /articles:
 *   post:
 *     summary: 공지사항 생성
 *     description: 관리자가 공지 카테고리, 제목, 내용 등을 입력하여 새로운 공지사항을 생성합니다.
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

  if (reqWithPayload.user.role !== USER_ROLE.ADMIN) {
    throw new ForbiddenError();
  }

  await noticeService.createNotice(
    data,
    reqWithPayload.user.userId,
    reqWithPayload.user.apartmentId
  );

  res.status(201).send(new registerSuccessMessage());
}

/**
 * @openapi
 * /notices:
 *   get:
 *     summary: 공지사항 목록 조회
 *     description: 사용자 권한에 따라 공지사항 목록을 페이지 단위로 조회합니다.
 *                  SUPER_ADMIN 권한 사용자는 접근이 제한됩니다.
 *     tags:
 *       - Notices
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
 *               $ref: '#/components/schemas/ResponseNoticeListDTO'
 *       401:
 *         description: 권한이 없는 사용자입니다.
 *       400:
 *         description: 잘못된 요청입니다. 유효하지 않은 페이지 번호 또는 페이지 크기일 수 있습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
export async function getNoticeList(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  if ((reqWithPayload.user.role as string) === USER_ROLE.SUPER_ADMIN) {
    throw new ForbiddenError();
  }
  const data = create(req.query, PageParamsStruct);
  const result = await noticeService.getNoticeList(
    reqWithPayload.user.userId,
    reqWithPayload.user.role as USER_ROLE,
    data
  );
  res.send(new ResponseNoticeListDTO(result));
}

export async function getNotice(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  if ((reqWithPayload.user.role as string) === USER_ROLE.SUPER_ADMIN) {
    throw new ForbiddenError();
  }
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
export async function editNotice(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  if (reqWithPayload.user.role !== USER_ROLE.ADMIN) {
    throw new ForbiddenError();
  }
  const data = create(req.body, PatchNoticeBodyStruct);
  const { noticeId } = create(req.params, NoticeIdParamStruct);
  const notice = await noticeService.updateNotice(noticeId, data);
  res.status(200).send(new ResponseNoticeDTO(notice));
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
export async function removeNotice(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  if (reqWithPayload.user.role !== USER_ROLE.ADMIN) {
    throw new ForbiddenError();
  }
  const { noticeId } = create(req.params, NoticeIdParamStruct);
  await noticeService.removeNotice(noticeId);
  res.status(200).send(new removeSuccessMessage());
}
