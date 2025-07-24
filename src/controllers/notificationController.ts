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
 * @swagger
 * /api/notifications/sse:
 *   get:
 *     summary: 읽지 않은 알림 실시간 수신 (SSE)
 *     description: 로그인된 사용자가 서버로부터 실시간 알림을 받기 위해 SSE 연결을 설정합니다.
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: SSE 연결 성공
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: |
 *                 data: {
 *                   "type": "alarm",
 *                   "data": [
 *                     {
 *                       "notificationId": "string",
 *                       "content": "string",
 *                       "notificationType": "COMPLAINT",
 *                       "notifiedAt": "2024-07-23T12:34:56.000Z",
 *                       "isChecked": false,
 *                       "complaintId": "string",
 *                       "noticeId": null,
 *                       "pollId": null
 *                     }
 *                   ]
 *                 }
 *       401:
 *         description: 인증 실패
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
};

/**
 * @swagger
 * /api/notifications/:notificationId/read:
 *   patch:
 *     summary: 알림 상태 업데이트
 *     description: 알림의 읽음 상태(isRead)를 true 또는 false로 업데이트합니다.
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 업데이트할 알림의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isRead:
 *                 type: boolean
 *                 description: 알림 읽음 상태
 *             required:
 *               - isRead
 *     responses:
 *       200:
 *         description: 알림 상태 업데이트 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 알림 상태가 업데이트되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "f9b3b79d-8a24-4f26-b19d-afe334cb87a9"
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     type:
 *                       type: string
 *                       description: "알림 종류 (예: complaint, notice, poll)"
 *                     content:
 *                       type: string
 *                     isRead:
 *                       type: boolean
 *                     referenceId:
 *                       type: string
 *                       nullable: true
 *                       description: "관련 게시물 ID (complaintId, noticeId, pollId 중 하나)"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       nullable: true
 *     security:
 *       - access-token: []
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
 * @swagger
 * /api/notifications/me/unread-count:
 *   get:
 *     summary: 읽지 않은 알림 개수 조회
 *     description: 로그인된 사용자의 읽지 않은 알림 개수를 반환합니다.
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: 읽지 않은 알림 개수 조회에 성공했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 읽지 않은 알림 개수 조회에 성공했습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
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
 * @swagger
 * /notifications/mark-all-read:
 *   patch:
 *     summary: 모든 알림 읽음 처리
 *     description: 현재 로그인한 사용자의 모든 알림을 읽음 처리합니다.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 모든 알림이 읽음 처리됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 모든 알림이 읽음 처리되었습니다.
 *                 data:
 *                   type: "null"
 *       401:
 *         description: 인증되지 않은 사용자
 *       500:
 *         description: 서버 오류
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
