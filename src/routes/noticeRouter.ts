import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  createNotice,
  editNotice,
  getNotice,
  getNoticeList,
  removeNotice,
} from "../controllers/noticeController";
import authenticate from "@/middlewares/authenticate";
import { requireRole } from "@/middlewares/requireRole";
import { USER_ROLE } from "@prisma/client";

const noticesRouter = express.Router();
noticesRouter.get(
  "/:noticeId",
  authenticate(),
  requireRole([USER_ROLE.ADMIN, USER_ROLE.USER]),
  withAsync(getNotice)
);
noticesRouter.put(
  "/:noticeId",
  authenticate(),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(editNotice)
);
noticesRouter.delete(
  "/:noticeId",
  authenticate(),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(removeNotice)
);
noticesRouter.post(
  "/",
  authenticate(),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(createNotice)
);
noticesRouter.get(
  "/",
  authenticate(),
  requireRole([USER_ROLE.ADMIN, USER_ROLE.USER]),
  withAsync(getNoticeList)
);

export default noticesRouter;
