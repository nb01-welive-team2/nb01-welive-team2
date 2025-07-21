import express from "express";
import { withAsync } from "../lib/withAsync";
import authenticate from "@/middlewares/authenticate";
import {
  sseNotificationHandler,
  patchNotificationHandler,
  getUnreadNotificationCountHandler,
  markAllNotificationsAsReadHandler,
} from "../controllers/notificationController";

const notificationsRouter = express.Router();

// SSE 알림 수신
notificationsRouter.get(
  "/notifications/sse",
  authenticate(),
  withAsync(sseNotificationHandler)
);

// 개별 알림 읽음 처리
notificationsRouter.patch(
  "/notifications/:notificationId/read",
  authenticate(),
  withAsync(patchNotificationHandler)
);

// 읽지 않은 알림 개수 조회
notificationsRouter.get(
  "/notifications/me/unread-count",
  authenticate(),
  withAsync(getUnreadNotificationCountHandler)
);

// 모든 알림 읽음 처리
notificationsRouter.post(
  "/notifications/mark-all-read",
  authenticate(),
  withAsync(markAllNotificationsAsReadHandler)
);

export default notificationsRouter;
