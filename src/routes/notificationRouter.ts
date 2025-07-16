import express from "express";
import { withAsync } from "../lib/withAsync";
import authenticate from "@/middlewares/authenticate";
import {
  getNotificationsHandler,
  patchNotificationHandler,
  getNotificationByIdHandler,
  createNotificationHandler,
  getUnreadNotificationCountHandler,
  markAllNotificationsAsReadHandler,
} from "../controllers/notificationController";
import { getNotifications } from "../services/notificationService";

const notificationsRouter = express.Router();

// 알림 목록 조회
notificationsRouter.get(
  "/notifications",
  authenticate(),
  withAsync(getNotificationsHandler)
);

// SSE 실시간 알림 스트리밍
notificationsRouter.get(
  "/notifications/sse",
  authenticate(),
  async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const userId = (req as any).user.id;

    const sendUnreadNotifications = async () => {
      try {
        const unreadNotifications = await getNotifications(userId, false);
        const payload = {
          type: "alarm",
          data: unreadNotifications.map((n) => ({
            notificationId: n.id,
            content: n.content,
            notificationType: n.notificationType,
            notifiedAt: n.notifiedAt,
            isChecked: n.isChecked,
            complaintId: n.complaintId,
            noticeId: n.noticeId,
            pollId: n.pollId,
          })),
        };
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      } catch (error) {
        console.error("[SSE] Error fetching notifications:", error);
      }
    };

    await sendUnreadNotifications();
    const intervalId = setInterval(sendUnreadNotifications, 30000);

    req.on("close", () => {
      clearInterval(intervalId);
      res.end();
    });
  }
);

// 개별 알림 읽음 처리
notificationsRouter.patch(
  "/notifications/:notificationId/read",
  authenticate(),
  withAsync(patchNotificationHandler)
);

// 알림 상세 조회
notificationsRouter.get(
  "/notifications/:id",
  authenticate(),
  withAsync(getNotificationByIdHandler)
);

// 읽지 않은 알림 개수 조회
notificationsRouter.get(
  "/notifications/me/unread-count",
  authenticate(),
  withAsync(getUnreadNotificationCountHandler)
);

// 알림 생성
notificationsRouter.post(
  "/notifications",
  authenticate(),
  withAsync(createNotificationHandler)
);

// 모든 알림 읽음 처리
notificationsRouter.post(
  "/notifications/mark-all-read",
  authenticate(),
  withAsync(markAllNotificationsAsReadHandler)
);

export default notificationsRouter;
