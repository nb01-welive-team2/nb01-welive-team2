import express from "express";
import { withAsync } from "../lib/withAsync";
import authenticate, { queryAuth } from "@/middlewares/authenticate";
import {
  sseNotificationHandler,
  patchNotificationHandler,
  getUnreadNotificationCountHandler,
  markAllNotificationsAsReadHandler,
} from "../controllers/notificationController";

const notificationsRouter = express.Router();

// SSE 알림 수신
notificationsRouter.get("/sse", queryAuth(), withAsync(sseNotificationHandler));

// 읽지 않은 알림 개수 조회
notificationsRouter.get(
  "/me/unread-count",
  authenticate(),
  withAsync(getUnreadNotificationCountHandler)
);

// 모든 알림 읽음 처리
notificationsRouter.post(
  "/mark-all-read",
  authenticate(),
  withAsync(markAllNotificationsAsReadHandler)
);

// 개별 알림 읽음 처리
notificationsRouter.patch(
  "/:notificationId/read",
  authenticate(),
  withAsync(patchNotificationHandler)
);

export default notificationsRouter;
