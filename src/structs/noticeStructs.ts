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
  defaulted,
} from "superstruct";
import { integerString, UUID } from "./commonStructs";

const NoticeCategoryEnum = union([
  literal("MAINTENANCE"),
  literal("EMERGENCY"),
  literal("COMMUNITY"),
  literal("RESIDENT_VOTE"),
  literal("RESIDENT_COUNCIL"),
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

export const NoticePageParamsStruct = object({
  page: defaulted(integerString, 1),
  limit: defaulted(integerString, 11),
  category: defaulted(NoticeCategoryEnum, undefined),
  keyword: defaulted(nonempty(string()), ""),
});
export type NoticePageParamsType = Infer<typeof NoticePageParamsStruct>;
