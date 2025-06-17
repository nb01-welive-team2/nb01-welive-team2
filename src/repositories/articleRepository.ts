import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function create(article: Prisma.ArticlesCreateInput) {
  return await prisma.articles.create({
    data: article,
  });
}

// async function update(articleId: number, data: Prisma.ArticlesUpdateInput) {
//   return await prisma.articles.update({
//     data,
//     where: {
//       id: articleId,
//     },
//     include: {
//       _count: {
//         select: { users: true },
//       },
//     },
//   });
// }

// async function findByName(articleName: string) {
//   return await prisma.articles.findUnique({
//     where: {
//       articleName,
//     },
//   });
// }

// async function getList(params: Prisma.ArticlesFindManyArgs) {
//   return await prisma.articles.findMany({
//     ...params,
//     include: {
//       _count: {
//         select: { users: true },
//       },
//     },
//   });
// }

// async function getCount(params: Prisma.ArticlesCountArgs) {
//   return await prisma.articles.count({
//     ...params,
//   });
// }

// async function deleteById(articleId: number) {
//   return await prisma.articles.delete({
//     where: {
//       id: articleId,
//     },
//   });
// }

export default {
  create,
  // update,
  // findByName,
  // getList,
  // getCount,
  // deleteById,
};
