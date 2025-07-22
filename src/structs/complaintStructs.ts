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
import { COMPLAINT_STATUS } from "@prisma/client";

export const CreateComplaintBodyStruct = object({
  title: nonempty(string()),
  content: string(),
  isPublic: boolean(),
});
export type CreateComplaintBodyType = Infer<typeof CreateComplaintBodyStruct>;

export const PatchComplaintBodyStruct = partial(CreateComplaintBodyStruct);
export type PatchComplaintBodyType = Infer<typeof PatchComplaintBodyStruct>;

export const ComplaintIdParamStruct = object({
  complaintId: UUID,
});

export const ComplaintStatusStruct = object({
  status: union([
    literal(COMPLAINT_STATUS.PENDING),
    literal(COMPLAINT_STATUS.IN_PROGRESS),
    literal(COMPLAINT_STATUS.RESOLVED),
  ]),
});
export type ComplaintStatusType = Infer<typeof ComplaintStatusStruct>;
