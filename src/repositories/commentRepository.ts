import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function createNoticeComment(comment: Prisma.NoticeCommentsCreateInput) {
  return await prisma.noticeComments.create({
    data: comment,
  });
}

async function createComplaintComment(
  comment: Prisma.ComplaintCommentsCreateInput
) {
  return await prisma.complaintComments.create({
    data: comment,
  });
}

async function updateNoticeComment(
  commentId: string,
  data: Prisma.NoticeCommentsUpdateInput
) {
  return await prisma.noticeComments.update({
    where: {
      id: commentId,
    },
    data,
  });
}

async function updateComplaintComment(
  commentId: string,
  data: Prisma.ComplaintCommentsUpdateInput
) {
  return await prisma.complaintComments.update({
    where: {
      id: commentId,
    },
    data,
  });
}

async function getNoticeCommentById(commentId: string) {
  return await prisma.noticeComments.findUnique({
    where: {
      id: commentId,
    },
  });
}

async function getComplaintCommentById(commentId: string) {
  return await prisma.complaintComments.findUnique({
    where: {
      id: commentId,
    },
  });
}

async function deleteNoticeComment(commentId: string) {
  return await prisma.noticeComments.delete({
    where: {
      id: commentId,
    },
  });
}

async function deleteComplaintComment(commentId: string) {
  return await prisma.complaintComments.delete({
    where: {
      id: commentId,
    },
  });
}

export default {
  createNoticeComment,
  createComplaintComment,
  updateNoticeComment,
  updateComplaintComment,
  getNoticeCommentById,
  getComplaintCommentById,
  deleteNoticeComment,
  deleteComplaintComment,
};
