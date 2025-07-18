import { nonempty, object, Infer, literal, union, refine } from "superstruct";
import { DateTimeStringStruct, integerString, UUID } from "./commonStructs";

const EventCategoryEnum = union([literal("NOTICE"), literal("POLL")]);

export const UpdateEventStruct = object({
  boardType: nonempty(EventCategoryEnum),
  boardId: UUID,
  startDate: DateTimeStringStruct,
  endDate: DateTimeStringStruct,
});
export type UpdateEventType = Infer<typeof UpdateEventStruct>;

export const EventIdParamStruct = object({
  eventId: UUID,
});

export const GetEventStruct = object({
  apartmentId: UUID,
  year: refine(integerString, "4-digit year", (v) => v >= 1000 && v <= 9999),
  month: refine(
    integerString,
    "month between 1 and 12",
    (v) => v >= 1 && v <= 12
  ),
});
export type GetEventType = Infer<typeof GetEventStruct>;
