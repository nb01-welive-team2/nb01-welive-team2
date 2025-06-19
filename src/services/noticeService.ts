import noticeRepository from "../repositories/noticeRepository";
import {
  CreateNoticeBodyType,
  PatchNoticeBodyType,
} from "../structs/noticeStructs";
import { USER_ROLE } from "@prisma/client";
import { PageParamsType } from "../structs/commonStructs";
import { buildSearchCondition } from "../lib/searchCondition";
import userInfoRepository from "@/repositories/userInfoRepository";
import { getUserId } from "@/repositories/userRepository";
import NotFoundError from "@/errors/NotFoundError";
import ForbiddenError from "@/errors/ForbiddenError";

async function createNotice(
  notice: CreateNoticeBodyType,
  userId: string,
  apartmentId: string
) {
  await noticeRepository.create({
    user: { connect: { id: userId } },
    ApartmentInfo: { connect: { id: apartmentId } },
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

async function updateNotice(noticeId: string, body: PatchNoticeBodyType) {
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
