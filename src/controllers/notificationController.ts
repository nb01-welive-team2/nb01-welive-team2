import { Request, Response } from "express";
import {
  getNotifications,
  updateNotification,
  countUnreadNotifications,
  markAllNotificationsAsRead,
} from "../services/notificationService";
import {
  NotificaionParam,
  PatchNotificationStruct,
} from "../structs/notificationStructs";
import { create, validate } from "superstruct";
import { sseConnections } from "@/lib/sseHandler";
import { AuthenticatedRequest } from "@/types/express";

/**
 * @openapi
 * /notifications/sse:
 *   get:
 *     summary: 실시간 알림 수신
 *     description: Server-Sent Events (SSE)를 통해 실시간 알림을 스트리밍합니다.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 실시간 알림 스트림 시작
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: |
 *                 data: {
 *                   "type": "alarm",
 *                   "data": [
 *                     {
 *                       "notificationId": "noti-123",
 *                       "content": "새로운 공지사항이 등록되었습니다.",
 *                       "notificationType": "공지_등록",
 *                       "notifiedAt": "2025-07-18T10:00:00Z",
 *                       "isChecked": false,
 *                       "complaintId": null,
 *                       "noticeId": "notice-456",
 *                       "pollId": null
 *                     }
 *                   ]
 *                 }
 */
export const sseNotificationHandler = async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const reqWithPayload = req as AuthenticatedRequest;
  const userId = reqWithPayload.user.userId;

  sseConnections.set(userId, res);

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
    } catch (error) {}
  };
  await sendUnreadNotifications();
  const intervalId = setInterval(sendUnreadNotifications, 30000);

  // 하트비트: 15초마다 전송
  const heartbeat = setInterval(() => {
    res.write(":heartbeat\n\n");
  }, 15000);

  // 연결 종료 시 cleanup
  req.on("close", () => {
    clearInterval(intervalId);
    clearInterval(heartbeat);
    sseConnections.delete(userId);
    res.end();
  });

  // 클라이언트가 closeAfter 쿼리 파라미터를 보낸 경우 일정 시간 후 연결 종료
  if (req.query.closeAfter) {
    setTimeout(
      () => {
        res.end();
      },
      parseInt(req.query.closeAfter as string, 10)
    );
  }
};

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: 개별 알림 읽음 처리
 *     description: 지정된 알림을 읽음 처리합니다.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 알림 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isRead:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: 알림 상태가 업데이트되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 알림 상태가 업데이트되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: noti-123
 *                     userId:
 *                       type: string
 *                       example: user-1
 *                     type:
 *                       type: string
 *                       example: 공지_등록
 *                     content:
 *                       type: string
 *                       example: 새로운 공지사항이 등록되었습니다.
 *                     isRead:
 *                       type: boolean
 *                       example: true
 *                     referenceId:
 *                       type: string
 *                       nullable: true
 *                       example: notice-456
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-07-18T10:00:00Z
 *                     updatedAt:
 *                       type: string
 *                       nullable: true
 *                       example: null
 */
export const patchNotificationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = create(req.body, PatchNotificationStruct);
  const { notificationId } = create(req.params, NotificaionParam);
  const updated = await updateNotification(notificationId, body.isRead);
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

/**
 * @openapi
 * /notifications/me/unread-count:
 *   get:
 *     summary: 읽지 않은 알림 개수 조회
 *     description: 현재 로그인된 사용자의 읽지 않은 알림 개수를 반환합니다.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 성공적으로 읽지 않은 알림 개수를 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 읽지 않은 알림 개수 조회에 성공했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                       example: 3
 */
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

/**
 * @openapi
 * /notifications/mark-all-read:
 *   post:
 *     summary: 모든 알림 읽음 처리
 *     description: 현재 로그인된 사용자의 모든 알림을 읽음 처리합니다.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 모든 알림이 읽음 처리되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 모든 알림이 읽음 처리되었습니다.
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 */
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
