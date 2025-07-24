import { object, Infer } from "superstruct";
import { UUID } from "./commonStructs";

export const VoteBodyStruct = object({
  optionId: UUID,
});
export type VoteBodyType = Infer<typeof VoteBodyStruct>;
