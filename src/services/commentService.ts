import commentRepository from "../repositories/commentRepository";
import { CreateCommentBodyType } from "../structs/commentStructs";
import NotFoundError from "@/errors/NotFoundError";
import ForbiddenError from "@/errors/ForbiddenError";
import CommonError from "@/errors/CommonError";

async function createComment(comment: CreateCommentBodyType, userId: string) {
  if (comment.boardType === "COMPLAINT") {
    await commentRepository.createComplaintComment({
      content: comment.content,
      complaint: { connect: { id: comment.postId } },
      user: { connect: { id: userId } },
    });
  } else if (comment.boardType === "NOTICE") {
    await commentRepository.createNoticeComment({
      content: comment.content,
      notice: { connect: { id: comment.postId } },
      user: { connect: { id: userId } },
    });
  } else {
    throw new CommonError("Invalid board type", 400);
  }
}

async function updateComment(
  commentId: string,
  body: CreateCommentBodyType,
  userId: string
) {
  if (body.boardType === "COMPLAINT") {
    const comment = await commentRepository.getComplaintCommentById(commentId);
    if (!comment) {
      throw new NotFoundError("Comment", commentId);
    }
    if (comment?.userId !== userId) {
      throw new ForbiddenError(
        "You do not have permission to edit this comment."
      );
    }
    await commentRepository.updateComplaintComment(commentId, {
      content: body.content,
    });
  } else if (body.boardType === "NOTICE") {
    const comment = await commentRepository.getNoticeCommentById(commentId);
    if (!comment) {
      throw new NotFoundError("Comment", commentId);
    }
    if (comment?.userId !== userId) {
      throw new ForbiddenError(
        "You do not have permission to edit this comment."
      );
    }
    await commentRepository.updateNoticeComment(commentId, {
      content: body.content,
    });
  } else {
    throw new CommonError("Invalid board type", 400);
  }
}

async function removeComment(commentId: string, userId: string) {
  const noticeComment = await commentRepository.getNoticeCommentById(commentId);
  const complaintComment =
    await commentRepository.getComplaintCommentById(commentId);
  if (!noticeComment && !complaintComment) {
    throw new NotFoundError("Comment", commentId);
  }
  if (noticeComment && noticeComment.userId !== userId) {
    throw new ForbiddenError(
      "You do not have permission to delete this comment."
    );
  }
  if (complaintComment && complaintComment.userId !== userId) {
    throw new ForbiddenError(
      "You do not have permission to delete this comment."
    );
  }
  if (noticeComment) {
    await commentRepository.deleteNoticeComment(commentId);
  } else {
    await commentRepository.deleteComplaintComment(commentId);
  }
}

export default {
  createComment,
  updateComment,
  removeComment,
};
