import noticeRepository from "../repositories/noticeRepository";
import {
  CreateNoticeBodyType,
  PatchNoticeBodyType,
} from "../structs/noticeStructs";
import { BOARD_ID, USER_ROLE } from "@prisma/client";
import { PageParamsType } from "../structs/commonStructs";
import { buildSearchCondition } from "../lib/searchCondition";

async function createNotice(notice: CreateNoticeBodyType, userId: string) {
  await noticeRepository.create({
    user: { connect: { id: userId } },
    title: notice.title,
    content: notice.content,
    isPinned: notice.isPinned,
    category: notice.category,
  });
}

async function getNoticeList(
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

async function getNotice(noticeId: string) {
  return await noticeRepository.findById(noticeId);
}

async function updateNotice(noticeId: string, body: PatchNoticeBodyType) {
  return await noticeRepository.update(noticeId, body);
}

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
  updateNotice,
  getNotice,
  getNoticeList,
  // deleteNotice,
};
