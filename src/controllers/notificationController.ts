import { Request, Response } from "express";
import { NOTIFICATION_TYPE } from "@prisma/client";
import {
  getNotifications,
  updateNotification,
  getNotificationById,
  createNotification,
} from "../services/notificationService";

// 읽지 않은 알림 실시간 수신
export const getNotificationsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.query.userId as string;
    const isRead = req.query.isRead ? req.query.isRead === "true" : undefined;

    if (!userId) {
      res.status(400).json({
        code: 400,
        message: "userId는 필수값입니다.",
        data: null,
      });
      return;
    }

    const notifications = await getNotifications(userId, isRead);

    const formatted = notifications.map((n) => {
      const referenceId = n.complaintId || n.noticeId || n.pollId || null;
      return {
        id: n.id,
        userId: n.userId,
        type: n.notificationType,
        content: n.content,
        isRead: n.isChecked,
        referenceId,
        createdAt: n.notifiedAt,
        updatedAt: null,
      };
    });

    res.status(200).json({
      code: 200,
      message: "알림 목록 조회에 성공했습니다.",
      data: formatted,
    });
  } catch (error) {
    console.error("[GET /notifications] 서버 오류:", error);
    res.status(500).json({
      code: 500,
      message: "서버 내부 오류입니다.",
      data: null,
    });
  }
};

// 읽음 처리
export const patchNotificationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const { isRead } = req.body;

    if (typeof isRead !== "boolean") {
      res.status(400).json({
        code: 400,
        message: "isRead는 boolean 타입이어야 합니다.",
        data: null,
      });
      return;
    }

    const updated = await updateNotification(id, isRead);

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
  } catch (error) {
    console.error("[PATCH /notifications/:id] 서버 오류:", error);
    res.status(500).json({
      code: 500,
      message: "서버 내부 오류입니다.",
      data: null,
    });
  }
};

// 로그인 사용자의 읽지 않은 알림 개수 조회
export const getNotificationByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    const notification = await getNotificationById(id);
    if (!notification) {
      res.status(404).json({
        code: 404,
        message: "알림을 찾을 수 없습니다.",
        data: null,
      });
      return;
    }

    const referenceId =
      notification.complaintId ||
      notification.noticeId ||
      notification.pollId ||
      null;

    res.status(200).json({
      code: 200,
      message: "알림 조회에 성공했습니다.",
      data: {
        id: notification.id,
        userId: notification.userId,
        type: notification.notificationType,
        content: notification.content,
        isRead: notification.isChecked,
        referenceId,
        createdAt: notification.notifiedAt,
        updatedAt: null,
      },
    });
  } catch (error) {
    console.error("[GET /notifications/:id] 서버 오류:", error);
    res.status(500).json({
      code: 500,
      message: "서버 내부 오류입니다.",
      data: null,
    });
  }
};

// 모든 알림 읽음 처리
export const createNotificationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, type, content, referenceId } = req.body;

    // 필수값 누락 확인
    if (!userId || !type || !content) {
      res.status(400).json({
        code: 400,
        message: "userId, type, content는 필수값입니다.",
        data: null,
      });
      return;
    }

    // type === enum 확인
    if (!Object.values(NOTIFICATION_TYPE).includes(type)) {
      res.status(400).json({
        code: 400,
        message: `type 값은 다음 중 하나여야 합니다: ${Object.values(NOTIFICATION_TYPE).join(", ")}`,
        data: null,
      });
      return;
    }

    const created = await createNotification({
      userId,
      type,
      content,
      referenceId,
    });

    const reference =
      created.complaintId || created.noticeId || created.pollId || null;

    res.status(201).json({
      code: 201,
      message: "알림이 생성되었습니다.",
      data: {
        id: created.id,
        userId: created.userId,
        type: created.notificationType,
        content: created.content,
        isRead: created.isChecked,
        referenceId: reference,
        createdAt: created.notifiedAt,
        updatedAt: null,
      },
    });
  } catch (error) {
    console.error("[POST /notifications] 서버 오류:", error);
    res.status(500).json({
      code: 500,
      message: "서버 내부 오류입니다.",
      data: null,
    });
  }
};
