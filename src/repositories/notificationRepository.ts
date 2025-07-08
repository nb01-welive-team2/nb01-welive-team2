import { prisma } from "../lib/prisma";
import { Notifications } from "@prisma/client";

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
