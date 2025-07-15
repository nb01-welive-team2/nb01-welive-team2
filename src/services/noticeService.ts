import noticeRepository from "../repositories/noticeRepository";
import {
  CreateNoticeBodyType,
  NoticePageParamsType,
  PatchNoticeBodyType,
} from "../structs/noticeStructs";
import { EVENT_TYPE, USER_ROLE } from "@prisma/client";
import { buildSearchCondition } from "../lib/searchCondition";
import userInfoRepository from "@/repositories/userInfoRepository";
import { getUserId } from "@/repositories/userRepository";
import NotFoundError from "@/errors/NotFoundError";
import ForbiddenError from "@/errors/ForbiddenError";
import { createEvent, editEvent } from "@/repositories/eventRepository";

async function createNotice(
  notice: CreateNoticeBodyType,
  userId: string,
  apartmentId: string,
  isEvent: boolean
) {
  const event = await createEvent({
    eventType: EVENT_TYPE.NOTICE,
    isActive: isEvent,
  });
  await noticeRepository.create({
    user: { connect: { id: userId } },
    ApartmentInfo: { connect: { id: apartmentId } },
    title: notice.title,
    content: notice.content,
    isPinned: notice.isPinned,
    category: notice.category,
    event: { connect: { id: event.id } },
    ...(notice.startDate && { startDate: notice.startDate }),
    ...(notice.endDate && { endDate: notice.endDate }),
  });
}

async function getNoticeList(
  apartmentId: string,
  params: NoticePageParamsType
) {
  const additionalCondition = {
    ...(params.category !== undefined && { category: params.category }),
  };
  const searchCondition = await buildSearchCondition(
    params.page,
    params.limit,
    params.keyword,
    { apartmentId, ...additionalCondition }
  );

  const totalCount = await noticeRepository.getCount({
    where: searchCondition.whereCondition,
  });
  const notices = await noticeRepository.getList(searchCondition.bothCondition);

  return { notices, totalCount };
}

async function getNotice(noticeId: string, userId: string, role: USER_ROLE) {
  let apartmentId: string;
  if (role === USER_ROLE.USER) {
    const userInfo = await userInfoRepository.findByUserId(userId);
    if (!userInfo) {
      throw new NotFoundError("UserInto", userId);
    }
    apartmentId = userInfo.apartmentId;
  } else {
    const user = await getUserId(userId);
    if (!user?.apartmentInfo?.id) {
      throw new NotFoundError("ApartmentInfo", userId);
    }
    apartmentId = user.apartmentInfo.id;
  }

  const notice = await noticeRepository.findById(noticeId);
  if (!notice) {
    throw new NotFoundError("Notice", noticeId);
  }

  if (apartmentId !== notice.user.apartmentInfo?.id) {
    throw new ForbiddenError();
  }
  return notice;
}

async function updateNotice(
  noticeId: string,
  body: PatchNoticeBodyType,
  isEvent: boolean
) {
  const notice = await noticeRepository.findById(noticeId);
  if (!notice?.event) {
    throw new NotFoundError("Notice Or Event", noticeId);
  }
  await editEvent(notice.event.id, {
    isActive: isEvent,
  });
  return await noticeRepository.update(noticeId, body);
}

async function removeNotice(noticeId: string) {
  return await noticeRepository.deleteById(noticeId);
}

export default {
  createNotice,
  updateNotice,
  getNotice,
  getNoticeList,
  removeNotice,
};
