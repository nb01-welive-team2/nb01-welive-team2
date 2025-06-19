import {
  nonempty,
  object,
  string,
  Infer,
  optional,
  literal,
  union,
  boolean,
  partial,
} from "superstruct";
import { UUID } from "./commonStructs";

const NoticeCategoryEnum = union([
  literal("MAINTENANCE"),
  literal("EMERGENCY"),
  literal("COMMUNITY"),
  literal("RESIDENT_VOTE"),
  literal("ETC"),
]);

export const CreateNoticeBodyStruct = object({
  category: nonempty(NoticeCategoryEnum),
  title: nonempty(string()),
  content: string(),
  isPinned: boolean(),
});
export type CreateNoticeBodyType = Infer<typeof CreateNoticeBodyStruct>;

export const PatchNoticeBodyStruct = partial(CreateNoticeBodyStruct);
export type PatchNoticeBodyType = Infer<typeof PatchNoticeBodyStruct>;

export const NoticeIdParamStruct = object({
  noticeId: UUID,
});
