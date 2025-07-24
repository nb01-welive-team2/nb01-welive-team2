import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  getPoll,
  editPoll,
  removePoll,
  createPoll,
  getPollList,
} from "../controllers/pollController";
import authenticate from "@/middlewares/authenticate";
import { requireRole } from "@/middlewares/requireRole";
import { USER_ROLE } from "@prisma/client";

const pollsRouter = express.Router();
pollsRouter.get(
  "/:pollId",
  authenticate(),
  requireRole([USER_ROLE.ADMIN, USER_ROLE.USER]),
  withAsync(getPoll)
);
pollsRouter.put(
  "/:pollId",
  authenticate(),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(editPoll)
);
pollsRouter.delete(
  "/:pollId",
  authenticate(),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(removePoll)
);
pollsRouter.post(
  "/",
  authenticate(),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(createPoll)
);
pollsRouter.get(
  "/",
  authenticate(),
  requireRole([USER_ROLE.ADMIN, USER_ROLE.USER]),
  withAsync(getPollList)
);

export default pollsRouter;
