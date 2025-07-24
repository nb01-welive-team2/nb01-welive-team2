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
 * /api/notifications/sse:
 *   get:
 *     summary: 실시간 알림 수신 SSE
 *     description: 서버와 SSE 연결을 설정하여 새로운 알림을 실시간으로 수신합니다.
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 액세스 토큰 SSE 인증용
 *       - in: query
 *         name: closeAfter
 *         required: true
 *         schema:
 *           type: string
 *           example: "100"
 *         description: SSE 연결을 일정 시간 후 종료하기 위한 쿼리 파라미터 테스트 용도
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
 *                       "notificationId": "1234-abcd",
 *                       "content": "새로운 공지가 등록되었습니다.",
 *                       "notificationType": "NOTICE",
 *                       "notifiedAt": "2025-07-24T12:34:56.000Z",
 *                       "isChecked": false,
 *                       "complaintId": null,
 *                       "noticeId": "abcd-1234",
 *                       "pollId": null
 *                     }
 *                   ]
 *                 }
 *       401:
 *         description: 인증 실패 토큰 누락 또는 유효하지 않음
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

  // 연결 종료 시 cleanup
  req.on("close", () => {
    clearInterval(intervalId);
    sseConnections.delete(userId);
    res.end();
  });

  // 클라이언트가 closeAfter 쿼리 파라미터를 보낸 경우 일정 시간 후 연결 종료
  if (process.env.NODE_ENV !== "production") {
    setTimeout(() => {
      clearInterval(intervalId);
      sseConnections.delete(userId);
      res.end();
    }, 100);
    if (req.query.closeAfter) {
      setTimeout(
        () => {
          res.end();
        },
        parseInt(req.query.closeAfter as string, 10)
      );
    }
  }
};

/**
 * @openapi
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     summary: 알림 읽음 상태 업데이트
 *     description: 특정 알림의 읽음 상태(`isRead`)를 true 또는 false로 변경합니다.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
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
 *                 example: true
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
 *                       example: "c7d7b79d-1a22-4f56-b12d-afc334cb67a1"
 *                     type:
 *                       type: string
 *                       description: 알림 종류
 *                       example: COMPLAINT
 *                     content:
 *                       type: string
 *                       example: "새로운 민원이 등록되었습니다."
 *                     isRead:
 *                       type: boolean
 *                       example: true
 *                     referenceId:
 *                       type: string
 *                       nullable: true
 *                       description: 관련 게시물 ID (complaintId, noticeId, pollId 중 하나)
 *                       example: "complaint-123"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-24T12:34:56.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *       401:
 *         description: 인증되지 않은 사용자
 *       404:
 *         description: 알림을 찾을 수 없음
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
 * /api/notifications/me/unread-count:
 *   get:
 *     summary: 읽지 않은 알림 개수 조회
 *     description: 로그인된 사용자의 읽지 않은 알림 개수를 반환합니다.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 읽지 않은 알림 개수 조회 성공
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
 *       401:
 *         description: 인증되지 않은 사용자
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
 * /api/notifications/mark-all-read:
 *   patch:
 *     summary: 모든 알림 읽음 처리
 *     description: 현재 로그인한 사용자의 모든 알림을 읽음 처리합니다.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 모든 알림 읽음 처리 성공
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
 *                   type: object
 *                   nullable: true
 *                   example: null
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
