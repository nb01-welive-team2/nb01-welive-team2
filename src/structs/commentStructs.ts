import {
  object,
  string,
  Infer,
  literal,
  union,
  partial,
  optional,
} from "superstruct";
import { UUID } from "./commonStructs";

const CommentCategoryEnum = union([literal("NOTICE"), literal("COMPLAINT")]);

export const CreateCommentBodyStruct = object({
  content: string(),
  boardType: CommentCategoryEnum,
  postId: UUID,
});
export type CreateCommentBodyType = Infer<typeof CreateCommentBodyStruct>;

export const PatchCommentBodyStruct = object({
  content: string(),
  boardType: CommentCategoryEnum,
  boardId: optional(string()),
});
export type PatchCommentBodyType = Infer<typeof PatchCommentBodyStruct>;

export const CommentIdParamStruct = object({
  commentId: UUID,
});
