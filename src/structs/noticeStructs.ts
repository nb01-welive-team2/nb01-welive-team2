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
  coerce,
  integer,
  StructError,
} from "superstruct";
import {
  DateTimeStringStruct,
  integerString,
  integerString1,
  integerString11,
  searchKeywordStruct,
  UUID,
} from "./commonStructs";
import { NOTICE_CATEGORY } from "@prisma/client";
import CommonError from "@/errors/CommonError";

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
  startDate: optional(DateTimeStringStruct),
  endDate: optional(DateTimeStringStruct),
});
export type CreateNoticeBodyType = Infer<typeof CreateNoticeBodyStruct>;

export const PatchNoticeBodyStruct = partial(CreateNoticeBodyStruct);
export type PatchNoticeBodyType = Infer<typeof PatchNoticeBodyStruct>;

export const NoticeIdParamStruct = object({
  noticeId: UUID,
});

const noticeCategoryStruct = coerce(
  optional(NoticeCategoryEnum),
  string(),
  (value) => {
    if (value in NOTICE_CATEGORY) return value;
    else if (value === undefined) return undefined;
    else throw new CommonError("notice category struct err", 400);
  }
);

export const NoticePageParamsStruct = object({
  page: integerString1,
  limit: integerString11,
  category: noticeCategoryStruct,
  keyword: searchKeywordStruct,
});
export type NoticePageParamsType = Infer<typeof NoticePageParamsStruct>;
