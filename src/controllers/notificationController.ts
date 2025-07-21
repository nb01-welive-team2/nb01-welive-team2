import { Request, Response } from "express";
import {
  getNotifications,
  updateNotification,
  countUnreadNotifications,
  markAllNotificationsAsRead,
} from "../services/notificationService";
import { PatchNotificationStruct } from "../structs/notificationStructs";
import { validate } from "superstruct";

// SSE 알림 수신
export const sseNotificationHandler = async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const userId = (req as any).user.id;

  const sendUnreadNotifications = async () => {
    try {
      const unread = await getNotifications(userId, false);
      const payload = {
        type: "alarm",
        data: unread.map((n) => ({
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
      console.error("[SSE] Error:", error);
    }
  };

  await sendUnreadNotifications();
  const intervalId = setInterval(sendUnreadNotifications, 30000);

  req.on("close", () => {
    clearInterval(intervalId);
    res.end();
  });
};

// 알림 읽음 처리
export const patchNotificationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const [error] = validate(req.body, PatchNotificationStruct);
  if (error) {
    res.status(400).json({
      code: 400,
      message: "요청 형식이 올바르지 않습니다.",
      data: null,
    });
    return;
  }

  const id = req.params.id;
  const updated = await updateNotification(id, req.body.isRead);

  const referenceId =
    updated.complaintId || updated.noticeId || updated.pollId || null;

  res.status(200).json({
    code: 200,
    message: "알림 상태가 업데이트되었습니다.",
    data: {
      id: updated.id,
      userId: updated.userId,
      type: updated.notificationType,
      content: updated.content,
      isRead: updated.isChecked,
      referenceId,
      createdAt: updated.notifiedAt,
      updatedAt: null,
    },
  });
};

// 읽지 않은 알림 반환
export const getUnreadNotificationCountHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).user.id;

  const count = await countUnreadNotifications(userId);

  res.status(200).json({
    code: 200,
    message: "읽지 않은 알림 개수 조회에 성공했습니다.",
    data: {
      count,
    },
  });
};

// 모든 알림 읽음 상태 변경
export const markAllNotificationsAsReadHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as any).user.id;

  await markAllNotificationsAsRead(userId);

  res.status(200).json({
    code: 200,
    message: "모든 알림이 읽음 처리되었습니다.",
    data: null,
  });
};
