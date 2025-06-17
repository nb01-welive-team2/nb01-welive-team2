import { object, string, array, number, optional, refine } from "superstruct";

const isDateString = (value: any) => !isNaN(Date.parse(value));

export const createPollSchema = object({
  title: string(),
  description: optional(string()),
  startDate: refine(string(), "startDate", isDateString),
  endDate: refine(string(), "endDate", isDateString),
  options: array(string()),
  buildingPermission: number(),
  status: optional(string()),
});

export const pollIdParamSchema = object({
  pollId: string(),
});
