import { prisma } from "../lib/prisma";
import { Notifications, NOTIFICATION_TYPE } from "@prisma/client";

export const findNotifications = async (
  userId: string,
  isRead?: boolean
): Promise<Notifications[]> => {
  return prisma.notifications.findMany({
    where: {
      userId,
      ...(isRead !== undefined && { isChecked: isRead }),
    },
    orderBy: {
      notifiedAt: "desc",
    },
  });
};

export const updateNotificationById = async (
  id: string,
  isRead: boolean
): Promise<Notifications> => {
  return prisma.notifications.update({
    where: { id },
    data: { isChecked: isRead },
  });
};

export const findNotificationById = async (
  id: string
): Promise<Notifications | null> => {
  return prisma.notifications.findUnique({
    where: { id },
  });
};

export const createNotificationInDb = async (data: {
  userId: string;
  type: NOTIFICATION_TYPE;
  content: string;
  referenceId?: string;
}): Promise<Notifications> => {
  const { userId, type, content, referenceId } = data;

  return prisma.notifications.create({
    data: {
      userId,
      notificationType: type,
      content,
      isChecked: false,
      ...(type === "민원_등록" && referenceId && { complaintId: referenceId }),
      ...(type === "공지_등록" && referenceId && { noticeId: referenceId }),
    },
  });
};

export const countUnreadNotificationsInDb = async (
  userId: string
): Promise<number> => {
  return prisma.notifications.count({
    where: {
      userId,
      isChecked: false,
    },
  });
};

export const markAllNotificationsAsReadInDb = async (
  userId: string
): Promise<void> => {
  await prisma.notifications.updateMany({
    where: {
      userId,
      isChecked: false,
    },
    data: {
      isChecked: true,
    },
  });
};
