import { findNotifications } from "../repositories/notificationRepository";
import { Notifications } from "@prisma/client";

export const getNotifications = async (
  userId: string,
  isRead?: boolean
): Promise<Notifications[]> => {
  return findNotifications(userId, isRead);
};
