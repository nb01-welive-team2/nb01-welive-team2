export interface PatchNotificationRequestDto {
  isRead: boolean;
}

export interface GetNotificationListQuery {
  userId: string;
  isRead?: boolean;
}
