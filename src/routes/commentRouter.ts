import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  createComment,
  editComment,
  removeComment,
} from "../controllers/commentController";
import authenticate from "@/middlewares/authenticate";

const commentsRouter = express.Router();
commentsRouter.put("/:commentId", authenticate(), withAsync(editComment));
commentsRouter.delete("/:commentId", authenticate(), withAsync(removeComment));
commentsRouter.post("/", authenticate(), withAsync(createComment));

export default commentsRouter;
