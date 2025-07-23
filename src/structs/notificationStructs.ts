import { boolean, object, optional, string, Infer } from "superstruct";
import { UUID } from "./commonStructs";

export const CreateNotificationStruct = object({
  userId: string(),
  type: string(),
  content: string(),
  referenceId: optional(string()),
});

export type CreateNotificationInput = Infer<typeof CreateNotificationStruct>;

export const PatchNotificationStruct = object({
  isRead: boolean(),
});

export type PatchNotificationInput = Infer<typeof PatchNotificationStruct>;

export const NotificaionParam = object({
  notificationId: UUID,
});

export const GetNotificationListStruct = object({
  userId: string(),
  isRead: optional(boolean()),
});

export type GetNotificationListInput = Infer<typeof GetNotificationListStruct>;
