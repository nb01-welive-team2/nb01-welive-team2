import { object, string, Infer, literal, union, partial } from "superstruct";
import { UUID } from "./commonStructs";

const CommentCategoryEnum = union([
  literal("NOTICE"),
  literal("COMPLAINT"),
  literal("POLL"),
]);

export const CreateCommentBodyStruct = object({
  content: string(),
  boardType: CommentCategoryEnum,
  postId: UUID,
});
export type CreateCommentBodyType = Infer<typeof CreateCommentBodyStruct>;

// export const PatchCommentBodyStruct = partial(CreateCommentBodyStruct);
// export type PatchCommentBodyType = Infer<typeof PatchCommentBodyStruct>;

export const CommentIdParamStruct = object({
  commentId: UUID,
});
