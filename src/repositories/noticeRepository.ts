import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function create(notice: Prisma.NoticesCreateInput) {
  return await prisma.notices.create({
    data: notice,
  });
}

// async function update(noticeId: number, data: Prisma.NoticesUpdateInput) {
//   return await prisma.notices.update({
//     data,
//     where: {
//       id: noticeId,
//     },
//     include: {
//       _count: {
//         select: { users: true },
//       },
//     },
//   });
// }

// async function findByName(noticeName: string) {
//   return await prisma.notices.findUnique({
//     where: {
//       noticeName,
//     },
//   });
// }

async function getList(params: Prisma.NoticesFindManyArgs) {
  return await prisma.notices.findMany({
    ...params,
    include: {
      article: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
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

// async function deleteById(noticeId: number) {
//   return await prisma.notices.delete({
//     where: {
//       id: noticeId,
//     },
//   });
// }

export default {
  create,
  // update,
  // findByName,
  getList,
  getCount,
  // deleteById,
};
