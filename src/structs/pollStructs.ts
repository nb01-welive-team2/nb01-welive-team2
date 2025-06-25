import {
  object,
  string,
  array,
  number,
  optional,
  refine,
  size,
} from "superstruct";

const isDateString = (value: any) => !isNaN(Date.parse(value));

export const createPollSchema = object({
  title: string(),
  description: optional(string()),
  startDate: refine(string(), "startDate", isDateString),
  endDate: refine(string(), "endDate", isDateString),
  options: size(array(string()), 1, Infinity),
  buildingPermission: number(),
  status: optional(string()),
  apartmentId: string(),
}); // 생성 요청 유효성 검사

export const pollIdParamSchema = object({
  pollId: string(),
}); // 삭제 요청 유효성 검사
