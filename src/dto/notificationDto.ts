import { NOTIFICATION_TYPE } from "@prisma/client";

export interface CreateNotificationRequestDto {
  userId: string;
  type: NOTIFICATION_TYPE;
  content: string;
  referenceId?: string;
}

export interface PatchNotificationRequestDto {
  isRead: boolean;
}

export interface GetNotificationListQuery {
  userId: string;
  isRead?: boolean;
}
