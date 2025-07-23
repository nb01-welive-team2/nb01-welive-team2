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

export async function createComment(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const data = create(req.body, CreateCommentBodyStruct);
  await commentService.createComment(data, reqWithPayload.user.userId);

  res.status(201).send(new registerSuccessMessage());
}

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

export async function removeComment(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const { commentId } = create(req.params, CommentIdParamStruct);
  await commentService.removeComment(commentId, reqWithPayload.user.userId);
  res.status(200).send(new removeSuccessMessage());
}
