import express from "express";
import { withAsync } from "../lib/withAsync";
import authenticate from "@/middlewares/authenticate";
import { voteOption, removeOption } from "@/controllers/optionController";
import { requireRole } from "@/middlewares/requireRole";
import { USER_ROLE } from "@prisma/client";

const optionsRouter = express.Router();
optionsRouter.post(
  "/:optionId/vote",
  authenticate(),
  requireRole([USER_ROLE.ADMIN, USER_ROLE.USER]),
  withAsync(voteOption)
);
optionsRouter.delete(
  "/:optionId/vote",
  authenticate(),
  requireRole([USER_ROLE.ADMIN, USER_ROLE.USER]),
  withAsync(removeOption)
);

export default optionsRouter;
