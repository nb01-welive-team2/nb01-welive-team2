import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  createNotice,
  editNotice,
  getNotice,
  getNoticeList,
} from "../controllers/noticeController";

const noticesRouter = express.Router();
noticesRouter.get("/:noticeId", withAsync(getNotice));
noticesRouter.put("/:noticeId", withAsync(editNotice));
// noticesRouter.delete("/:noticeId", withAsync(removeNotice));
noticesRouter.post("/", withAsync(createNotice));
noticesRouter.get("/", withAsync(getNoticeList));

export default noticesRouter;
