import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  createNotice,
  editNotice,
  getNotice,
  getNoticeList,
  removeNotice,
} from "../controllers/complaintController";

const complaintsRouter = express.Router();
complaintsRouter.get("/:complaintId", withAsync(getNotice));
complaintsRouter.put("/:complaintId", withAsync(editNotice));
complaintsRouter.delete("/:complaintId", withAsync(removeNotice));
complaintsRouter.post("/", withAsync(createNotice));
complaintsRouter.get("/", withAsync(getNoticeList));

export default complaintsRouter;
