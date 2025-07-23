import { create } from "superstruct";
import { Request, Response } from "express";
import {
  CreateCommentBodyStruct,
  CommentIdParamStruct,
  PatchCommentBodyStruct,
} from "../structs/commentStructs";
import commentService from "../services/commentService";
import registerSuccessMessage from "../lib/responseJson/registerSuccess";
import removeSuccessMessage from "../lib/responseJson/removeSuccess";
import { AuthenticatedRequest } from "@/types/express";

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: 댓글 작성
 *     description: 새로운 댓글을 등록합니다.
 *     tags:
 *       - Comments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 format: uuid
 *                 description: 댓글을 달 게시글 ID
 *                 example: f1c531ea-8f03-4f12-a8bb-7899148354df"
 *               boardType:
 *                 type: string
 *                 enum: [NOTICE, VOTE, COMPLAINT]
 *                 description: 게시판 유형
 *               content:
 *                 type: string
 *                 description: 댓글 내용
 *                 example: "Notice에 댓글 등록하기 테스트"
 *             required:
 *               - postId
 *               - boardType
 *               - content
 *     responses:
 *       201:
 *         description: 댓글 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 message: "정상적으로 등록 처리되었습니다."
 *       401:
 *         description: 인증 실패
 */
export async function createComment(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const data = create(req.body, CreateCommentBodyStruct);
  await commentService.createComment(data, reqWithPayload.user.userId);

  res.status(201).send(new registerSuccessMessage());
}

/**
 * @swagger
 * /api/comments/{commentId}:
 *   patch:
 *     summary: 댓글 수정
 *     description: 기존 댓글을 수정합니다.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 수정할 댓글의 ID
 *         example: "25693b94-f02a-4034-8e14-c01df1760b20"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 수정할 댓글 내용
 *                 example: 사실 안 시끄러워요
 *               boardType:
 *                 type: string
 *                 enum: [NOTICE, VOTE, COMPLAINT]
 *                 description: 게시판 유형 (CommentCategoryEnum)
 *                 example: COMPLAINT
 *               boardId:
 *                 type: string
 *                 description: 관련 게시글 ID (complaintId, noticeId, pollId 중 하나)
 *                 example: "53b1f404-0919-462a-86bb-cfb79efb90cb"
 *             required:
 *               - content
 *               - boardType
 *               - boardId
 *     responses:
 *       200:
 *         description: 댓글이 성공적으로 수정되었습니다.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 공지사항 정보가 성공적으로 수정되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 댓글을 찾을 수 없음
 */

export async function editComment(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const data = create(req.body, PatchCommentBodyStruct);
  console.log("editComment data:", data);
  const { commentId } = create(req.params, CommentIdParamStruct);
  console.log("editComment commentId:", commentId);
  await commentService.updateComment(
    commentId,
    data,
    reqWithPayload.user.userId
  );
  console.log("Comment updated successfully");
  res.status(200).send("공지사항 정보가 성공적으로 수정되었습니다.");
}

/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     summary: 댓글 삭제
 *     description: 특정 댓글을 삭제합니다. 로그인된 사용자만 가능.
 *     tags:
 *       - Comment
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         description: 삭제할 댓글의 ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 댓글 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 댓글 삭제 완료
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 댓글을 찾을 수 없음
 */
export async function removeComment(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const { commentId } = create(req.params, CommentIdParamStruct);
  await commentService.removeComment(commentId, reqWithPayload.user.userId);
  res.status(200).send(new removeSuccessMessage());
}
