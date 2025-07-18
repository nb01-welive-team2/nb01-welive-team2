import {
  findNotifications,
  updateNotificationById,
  findNotificationById,
  createNotificationInDb,
} from "../repositories/notificationRepository";
import { NOTIFICATION_TYPE, USER_ROLE, Notifications } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { getIO } from "../sockets/registerSocketServer";
import { CreateNotificationRequestDto } from "../dto/notificationDto";

export const getNotifications = async (
  userId: string,
  isRead?: boolean
): Promise<Notifications[]> => {
  return findNotifications(userId, isRead);
};

export const updateNotification = async (
  id: string,
  isRead: boolean
): Promise<Notifications> => {
  return updateNotificationById(id, isRead);
};

export const getNotificationById = async (
  id: string
): Promise<Notifications | null> => {
  return findNotificationById(id);
};

export const createNotification = async (
  data: CreateNotificationRequestDto
): Promise<Notifications> => {
  const notification = await createNotificationInDb(data);
  const io = getIO();
  io.to(notification.userId).emit("notification", {
    id: notification.id,
    userId: notification.userId,
    type: notification.notificationType,
    content: notification.content,
    isRead: notification.isChecked,
    referenceId:
      notification.complaintId ||
      notification.noticeId ||
      notification.pollId ||
      null,
    createdAt: notification.notifiedAt,
    updatedAt: null,
  });
  return notification;
};

// 관리자 회원가입 시, 슈퍼 어드민에게 알림 전송
export const notifySuperAdminsOfAdminSignup = async () => {
  const superAdmins = await prisma.users.findMany({
    where: { role: USER_ROLE.SUPER_ADMIN },
  });

  const io = getIO();

  await Promise.all(
    superAdmins.map(async (admin) => {
      const notification = await createNotificationInDb({
        userId: admin.id,
        type: NOTIFICATION_TYPE.회원가입신청,
        content: "신규 관리자 회원가입 신청이 도착했습니다.",
      });

      io.to(admin.id).emit("notification", {
        id: notification.id,
        userId: notification.userId,
        type: notification.notificationType,
        content: notification.content,
        isRead: notification.isChecked,
        referenceId: null,
        createdAt: notification.notifiedAt,
        updatedAt: null,
      });
    })
  );
};

// 입주민 회원가입 시, 관리자에게 알림 전송
export const notifyAdminsOfResidentSignup = async () => {
  const admins = await prisma.users.findMany({
    where: { role: USER_ROLE.ADMIN },
  });

  const io = getIO();

  await Promise.all(
    admins.map(async (admin) => {
      const notification = await createNotificationInDb({
        userId: admin.id,
        type: NOTIFICATION_TYPE.회원가입신청,
        content: "신규 입주민 회원가입 신청이 도착했습니다.",
      });

      io.to(admin.id).emit("notification", {
        id: notification.id,
        userId: notification.userId,
        type: notification.notificationType,
        content: notification.content,
        isRead: notification.isChecked,
        referenceId: null,
        createdAt: notification.notifiedAt,
        updatedAt: null,
      });
    })
  );
};

// 민원 등록 시, 관리자에게 알림 전송
export const notifyAdminsOfNewComplaint = async (complaintId?: string) => {
  const admins = await prisma.users.findMany({
    where: { role: USER_ROLE.ADMIN },
  });

  const io = getIO();

  await Promise.all(
    admins.map(async (admin) => {
      const notification = await createNotificationInDb({
        userId: admin.id,
        type: NOTIFICATION_TYPE.민원_등록,
        content: "새로운 민원이 등록되었습니다.",
        referenceId: complaintId,
      });

      io.to(admin.id).emit("notification", {
        id: notification.id,
        userId: notification.userId,
        type: notification.notificationType,
        content: notification.content,
        isRead: notification.isChecked,
        referenceId: complaintId ?? null,
        createdAt: notification.notifiedAt,
        updatedAt: null,
      });
    })
  );
};

// 민원 상태 변경 시, 해당 입주민에게 알림 전송
export const notifyResidentOfComplaintStatusChange = async (
  userId: string,
  complaintId?: string
) => {
  const notification = await createNotificationInDb({
    userId,
    type: NOTIFICATION_TYPE.COMPLAINT_RESOLVED,
    content: "등록한 민원이 처리되었습니다.",
    referenceId: complaintId,
  });

  const io = getIO();
  io.to(userId).emit("notification", {
    id: notification.id,
    userId: notification.userId,
    type: notification.notificationType,
    content: notification.content,
    isRead: notification.isChecked,
    referenceId: complaintId ?? null,
    createdAt: notification.notifiedAt,
    updatedAt: null,
  });
};

// 공지사항 등록 시, 전체 입주민에게 알림 전송
export const notifyResidentsOfNewNotice = async (noticeId?: string) => {
  const residents = await prisma.users.findMany({
    where: { role: USER_ROLE.USER },
  });

  const io = getIO();

  await Promise.all(
    residents.map(async (resident) => {
      const notification = await createNotificationInDb({
        userId: resident.id,
        type: NOTIFICATION_TYPE.공지_등록,
        content: "새로운 공지사항이 등록되었습니다.",
        referenceId: noticeId,
      });

      io.to(resident.id).emit("notification", {
        id: notification.id,
        userId: notification.userId,
        type: notification.notificationType,
        content: notification.content,
        isRead: notification.isChecked,
        referenceId: noticeId ?? null,
        createdAt: notification.notifiedAt,
        updatedAt: null,
      });
    })
  );
};
