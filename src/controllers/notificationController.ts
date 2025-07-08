import { Request, Response } from "express";
import { getNotifications } from "../services/notificationService";

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
