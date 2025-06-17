import noticeRepository from "../repositories/noticeRepository";
import { CreateNoticeBodyType } from "../structs/noticeStructs";
import articleRepository from "../repositories/articleRepository";
import { BOARD_ID, USER_ROLE } from "@prisma/client";
import { PageParamsType } from "../structs/commonStructs";
import { buildSearchCondition } from "../lib/searchCondition";

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

async function getNotices(
  userId: string,
  role: USER_ROLE,
  params: PageParamsType
) {
  const searchCondition = await buildSearchCondition(params, { userId, role });

  const totalCount = await noticeRepository.getCount(
    searchCondition.whereCondition
  );

  const notices = await noticeRepository.getList(searchCondition.bothCondition);

  return { notices, totalCount };
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

// async function deleteNotice(noticeId: number) {
//   return await noticeRepository.deleteById(noticeId);
// }

export default {
  createNotice,
  // updateNotice,
  // getByName,
  getNotices,
  // deleteNotice,
};
