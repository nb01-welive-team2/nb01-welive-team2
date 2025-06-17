import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  createArticle,
  getArticleList,
  getArticle,
  updateArticle,
  deleteArticle,
  createComment,
  getCommentList,
  dislikeArticle,
  likeArticle,
} from "../controllers/articleController";

const noticesRouter = express.Router();
noticesRouter.get("/:noticeId", withAsync(getNotice));
noticesRouter.put("/:noticeId", withAsync(ediNotice));
noticesRouter.delete("/:noticeId", withAsync(removeNotice));
noticesRouter.post("/", withAsync(createNotice));
noticesRouter.get("/", withAsync(getNoticeList));

export default noticesRouter;
