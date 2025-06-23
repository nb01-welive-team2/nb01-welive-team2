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
