import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function create(notice: Prisma.NoticesCreateInput) {
  return await prisma.notices.create({
    data: notice,
  });
}

async function update(noticeId: string, data: Prisma.NoticesUpdateInput) {
  return await prisma.notices.update({
    data,
    where: {
      id: noticeId,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          NoticeComments: true,
        },
      },
    },
  });
}

async function findById(noticeId: string) {
  return await prisma.notices.findUnique({
    where: {
      id: noticeId,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
      NoticeComments: {
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });
}

async function getList(params: Prisma.NoticesFindManyArgs) {
  return await prisma.notices.findMany({
    ...params,
    include: {
      user: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          NoticeComments: true,
        },
      },
    },
  });
}

async function getCount(params: Prisma.NoticesCountArgs) {
  return await prisma.notices.count({
    ...params,
  });
}

async function deleteById(noticeId: string) {
  return await prisma.notices.delete({
    where: {
      id: noticeId,
    },
  });
}

export default {
  create,
  update,
  findById,
  getList,
  getCount,
  deleteById,
};
