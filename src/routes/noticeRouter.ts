import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  createNotice,
  editNotice,
  getNotice,
  getNoticeList,
  removeNotice,
} from "../controllers/noticeController";
import { authenticate } from "@/middlewares/authenticate";

const noticesRouter = express.Router();
noticesRouter.get("/:noticeId", authenticate(), withAsync(getNotice));
noticesRouter.put("/:noticeId", authenticate(), withAsync(editNotice));
noticesRouter.delete("/:noticeId", authenticate(), withAsync(removeNotice));
noticesRouter.post("/", authenticate(), withAsync(createNotice));
noticesRouter.get("/", authenticate(), withAsync(getNoticeList));

export default noticesRouter;
