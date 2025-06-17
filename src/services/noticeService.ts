import noticeRepository from "../repositories/noticeRepository";
import { CreateNoticeBodyType } from "../structs/noticeStructs";
import articleRepository from "../repositories/articleRepository";
import { BOARD_ID } from "@prisma/client";

async function createNotice(notice: CreateNoticeBodyType, userId: string) {
  const createdArticle = await articleRepository.create({
    user: { connect: { id: userId } },
    title: notice.title,
    content: notice.content,
    boardId: BOARD_ID.NOTICE,
  });
  await noticeRepository.create({
    article: { connect: { id: createdArticle.id } },
    isPinned: notice.isPinned,
    category: notice.category,
  });
}

// async function updateNotice(noticeId: number, body: PatchNoticeBodyType) {
//   const updatedNotice = await noticeRepository.update(noticeId, body);
//   return new ResponseNoticeDTO(updatedNotice);
// }

// async function getByName(noticeName: string) {
//   const notice = await noticeRepository.findByName(noticeName);
//   if (!notice) {
//     throw new NotFoundError("Notice", noticeName);
//   }
//   return notice;
// }

// async function getCompanies(params: PageParamsType) {
//   const searchCondition = buildSearchCondition(params, [
//     "noticeName",
//     "noticeCode",
//   ]);
//   const where = searchCondition.whereCondition;
//   const prismaParams = {
//     ...searchCondition.pageCondition,
//     where,
//   };

//   const companies = await noticeRepository.getList(prismaParams);
//   const totalItemCount = await noticeRepository.getCount({
//     where,
//   });

//   return {
//     totalItemCount,
//     companies,
//   };
// }

// async function deleteNotice(noticeId: number) {
//   return await noticeRepository.deleteById(noticeId);
// }

export default {
  createNotice,
  // updateNotice,
  // getByName,
  // getCompanies,
  // deleteNotice,
};
