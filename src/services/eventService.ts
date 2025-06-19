import noticeRepository from "../repositories/noticeRepository";
import { PatchNoticeBodyType } from "../structs/noticeStructs";
import { USER_ROLE } from "@prisma/client";
import { buildDateSearchCondition } from "../lib/searchCondition";

async function getEventList(
  userId: string,
  role: USER_ROLE,
  year: number,
  month: number
) {
  const searchCondition = await buildDateSearchCondition({
    userId,
    role,
    year,
    month,
  });

  const notices = await noticeRepository.getList(
    searchCondition.whereCondition
  );
  const polls = await pollRepository.getList(searchCondition.whereCondition);

  return { notices, polls };
}

async function updateEvent(noticeId: string, body: PatchNoticeBodyType) {
  return await noticeRepository.update(noticeId, body);
}

async function removeEvent(noticeId: string) {
  return await noticeRepository.deleteById(noticeId);
}

export default {
  getEventList,
  updateEvent,
  removeEvent,
};
