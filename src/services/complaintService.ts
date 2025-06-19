import complaintRepository from "../repositories/complaintRepository";
import {
  CreateComplaintBodyType,
  PatchComplaintBodyType,
} from "../structs/complaintStructs";
import { USER_ROLE } from "@prisma/client";
import { PageParamsType } from "../structs/commonStructs";
import { buildSearchCondition } from "../lib/searchCondition";
import userInfoRepository from "@/repositories/userInfoRepository";
import NotFoundError from "@/errors/NotFoundError";
import ForbiddenError from "@/errors/ForbiddenError";

async function createComplaint(
  complaint: CreateComplaintBodyType,
  userId: string
) {
  await complaintRepository.create({
    user: { connect: { id: userId } },
    title: complaint.title,
    content: complaint.content,
    isPublic: complaint.isPublic,
  });
}

async function getComplaintList(
  userId: string,
  role: USER_ROLE,
  params: PageParamsType
) {
  const searchCondition = await buildSearchCondition(params, { userId, role });

  const totalCount = await complaintRepository.getCount(
    searchCondition.whereCondition
  );

  const complaints = await complaintRepository.getList(
    searchCondition.bothCondition
  );
  for (const complaint of complaints) {
    if (!complaint.user.userInfo) {
      throw new NotFoundError("UserInfo", complaint.userId);
    }
  }
  type ComplaintWithUserInfo = Omit<(typeof complaints)[number], "user"> & {
    user: (typeof complaints)[number]["user"] & {
      userInfo: NonNullable<(typeof complaints)[number]["user"]["userInfo"]>;
    };
  };
  return {
    complaints: complaints as ComplaintWithUserInfo[],
    totalCount,
  };
}

async function getComplaint(complaintId: string, userId: string) {
  const userInfo = await userInfoRepository.findByUserId(userId);
  if (!userInfo) {
    throw new NotFoundError("User", userId);
  }
  const complaint = await complaintRepository.findById(complaintId);
  if (!complaint) {
    throw new NotFoundError("Complaint", complaintId);
  }
  if (userInfo.apartmentId !== complaint.user.apartmentInfo?.id) {
    throw new ForbiddenError();
  }
  return complaint;
}

async function updateComplaint(
  complaintId: string,
  body: PatchComplaintBodyType
) {
  return await complaintRepository.update(complaintId, body);
}

async function removeComplaint(complaintId: string) {
  return await complaintRepository.deleteById(complaintId);
}

export default {
  createComplaint,
  updateComplaint,
  getComplaint,
  getComplaintList,
  removeComplaint,
};
