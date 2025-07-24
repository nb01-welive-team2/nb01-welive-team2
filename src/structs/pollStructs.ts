import {
  object,
  string,
  array,
  number,
  optional,
  refine,
  size,
  any,
  Infer,
  partial,
} from "superstruct";

const isDateString = (value: any) => !isNaN(Date.parse(value));

export const createPollSchema = object({
  title: string(),
  content: optional(string()),
  startDate: refine(string(), "startDate", isDateString),
  endDate: refine(string(), "endDate", isDateString),
  options: size(array(object({ title: string() })), 1, Infinity),
  buildingPermission: number(),
  status: optional(string()),
  boardId: optional(any()),
  apartmentId: optional(string()),
}); // 생성 요청 유효성 검사
export type CreatePollSchemaType = Infer<typeof createPollSchema>;

export const PatchPollSchema = partial(createPollSchema);
export type PatchPollSchemaType = Infer<typeof PatchPollSchema>;

export const pollIdParamSchema = object({
  pollId: string(),
}); // 삭제 요청 유효성 검사
