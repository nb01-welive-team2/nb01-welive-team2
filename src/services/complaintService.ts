import complaintRepository from "../repositories/complaintRepository";
import {
  ComplaintStatusType,
  CreateComplaintBodyType,
  PatchComplaintBodyType,
} from "../structs/complaintStructs";
import { COMPLAINT_STATUS, USER_ROLE } from "@prisma/client";
import { PageParamsType } from "../structs/commonStructs";
import { buildSearchCondition } from "../lib/searchCondition";
import userInfoRepository from "@/repositories/userInfoRepository";
import NotFoundError from "@/errors/NotFoundError";
import ForbiddenError from "@/errors/ForbiddenError";
import { getUserId } from "@/repositories/userRepository";
import CommonError from "@/errors/CommonError";

async function createComplaint(
  complaint: CreateComplaintBodyType,
  userId: string,
  apartmentId: string
) {
  await complaintRepository.create({
    user: { connect: { id: userId } },
    ApartmentInfo: { connect: { id: apartmentId } },
    title: complaint.title,
    content: complaint.content,
    isPublic: complaint.isPublic,
  });
}

async function getComplaintList(
  userId: string,
  role: USER_ROLE,
  apartmentId: string,
  params: PageParamsType
) {
  let addtionalCondition = {};
  if (role === USER_ROLE.USER) {
    addtionalCondition = {
      OR: [{ isSecret: false }, { userId: userId, isSecret: true }],
    };
  }
  const searchCondition = await buildSearchCondition(
    params.page,
    params.limit,
    "",
    { ...addtionalCondition, apartmentId }
  );
  const totalCount = await complaintRepository.getCount({
    where: searchCondition.whereCondition,
  });

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

async function getComplaint(
  complaintId: string,
  userId: string,
  role: USER_ROLE
) {
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

  const complaint = await complaintRepository.findById(complaintId);
  if (!complaint) {
    throw new NotFoundError("Complaint", complaintId);
  }
  if (apartmentId !== complaint.apartmentId) {
    throw new ForbiddenError();
  }
  if (
    complaint.isSecret &&
    role === USER_ROLE.USER &&
    complaint.userId !== userId
  ) {
    throw new ForbiddenError(
      "You do not have permission to view this complaint."
    );
  }
  return complaint;
}

async function updateComplaint(
  complaintId: string,
  body: PatchComplaintBodyType
) {
  const complaint = await complaintRepository.findById(complaintId);
  if (complaint?.complaintStatus !== COMPLAINT_STATUS.PENDING) {
    throw new CommonError(
      "Complaint can only be updated when it is in PENDING status.",
      403
    );
  }
  return await complaintRepository.update(complaintId, body);
}

async function changeStatus(
  complaintId: string,
  body: { complaintStatus: COMPLAINT_STATUS }
) {
  return await complaintRepository.update(complaintId, body);
}

async function removeComplaint(complaintId: string) {
  const complaint = await complaintRepository.findById(complaintId);
  if (complaint?.complaintStatus !== COMPLAINT_STATUS.PENDING) {
    throw new CommonError(
      "Complaint can only be removed when it is in PENDING status.",
      403
    );
  }
  return await complaintRepository.deleteById(complaintId);
}

export default {
  createComplaint,
  updateComplaint,
  getComplaint,
  getComplaintList,
  removeComplaint,
  changeStatus,
};
