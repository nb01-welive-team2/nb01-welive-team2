import { create } from "superstruct";
import { Request, Response } from "express";
import { USER_ROLE } from "@prisma/client";
import {
  CreateCommentBodyStruct,
  CommentIdParamStruct,
  PatchCommentBodyStruct,
} from "../structs/commentStructs";
import commentService from "../services/commentService";
import registerSuccessMessage from "../lib/responseJson/registerSuccess";
import removeSuccessMessage from "../lib/responseJson/removeSuccess";
import { AuthenticatedRequest } from "@/types/express";
import ForbiddenError from "@/errors/ForbiddenError";

/**
 * @openapi
 * /api/comments:
 *   post:
 *     summary: 공지사항 생성 [관리자]
 *     description: 관리자가 공지 카테고리, 제목, 내용, 상단 고정 여부 및 선택적으로 이벤트 기간을 입력하여 새로운 공지사항을 생성합니다.
 *     tags:
 *       - Comments
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
export async function createComment(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const data = create(req.body, CreateCommentBodyStruct);
  await commentService.createComment(data, reqWithPayload.user.userId);

  res.status(201).send(new registerSuccessMessage());
}

/**
 * @openapi
 * /api/comments/{commentId}:
 *   put:
 *     summary: 공지사항 정보 수정 [관리자]
 *     description: 지정된 공지사항 정보를 수정합니다. ADMIN 권한을 가진 사용자만 접근할 수 있습니다.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: commentId
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
 *               $ref: '#/components/schemas/ResponseCommentDTO'
 *       400:
 *         description: 잘못된 요청입니다. 필수 필드가 누락되었거나 형식이 올바르지 않습니다.
 *       403:
 *         description: 관리자 권한이 없는 사용자입니다.
 *       404:
 *         description: 수정할 공지사항을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
export async function editComment(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const data = create(req.body, PatchCommentBodyStruct);
  const { commentId } = create(req.params, CommentIdParamStruct);
  await commentService.updateComment(
    commentId,
    data,
    reqWithPayload.user.userId
  );
  res.status(200).send("공지사항 정보가 성공적으로 수정되었습니다.");
}

/**
 * @openapi
 * /api/comments/{commentId}:
 *   delete:
 *     summary: 공지사항 삭제 [관리자]
 *     description: 지정된 공지사항을 삭제합니다. ADMIN 권한을 가진 사용자만 접근할 수 있습니다.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: commentId
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
export async function removeComment(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const { commentId } = create(req.params, CommentIdParamStruct);
  await commentService.removeComment(commentId, reqWithPayload.user.userId);
  res.status(200).send(new removeSuccessMessage());
}
