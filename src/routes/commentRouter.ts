import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  createComment,
  editComment,
  removeComment,
} from "../controllers/commentController";
import authenticate from "@/middlewares/authenticate";
import { requireRole } from "@/middlewares/requireRole";
import { USER_ROLE } from "@prisma/client";

const commentsRouter = express.Router();
commentsRouter.put(
  "/:commentId",
  authenticate(),
  requireRole([USER_ROLE.ADMIN, USER_ROLE.USER]),
  withAsync(editComment)
);
commentsRouter.delete(
  "/:commentId",
  authenticate(),
  requireRole([USER_ROLE.ADMIN, USER_ROLE.USER]),
  withAsync(removeComment)
);
commentsRouter.post(
  "/",
  authenticate(),
  requireRole([USER_ROLE.ADMIN, USER_ROLE.USER]),
  withAsync(createComment)
);

export default commentsRouter;
