import { Request, Response } from "express";
import { NOTIFICATION_TYPE } from "@prisma/client";
import {
  getNotifications,
  updateNotification,
  getNotificationById,
  createNotification,
} from "../services/notificationService";
import {
  CreateNotificationStruct,
  PatchNotificationStruct,
  GetNotificationListStruct,
} from "../structs/notificationStructs";
import { validate } from "superstruct";

// 알림 목록 조회
export const getNotificationsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = {
    userId: req.query.userId as string,
    isRead: req.query.isRead ? req.query.isRead === "true" : undefined,
  };

  const [error] = validate(query, GetNotificationListStruct);
  if (error) {
    res.status(400).json({
      code: 400,
      message: "요청 형식이 올바르지 않습니다.",
      data: null,
    });
    return;
  }

  const notifications = await getNotifications(query.userId, query.isRead);

  const formatted = notifications.map((n) => ({
    id: n.id,
    userId: n.userId,
    type: n.notificationType,
    content: n.content,
    isRead: n.isChecked,
    referenceId: n.complaintId || n.noticeId || n.pollId || null,
    createdAt: n.notifiedAt,
    updatedAt: null,
  }));

  res.status(200).json({
    code: 200,
    message: "알림 목록 조회에 성공했습니다.",
    data: formatted,
  });
};

// 단건 조회
export const getNotificationByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
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

// 알림 생성
export const createNotificationHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const [error] = validate(req.body, CreateNotificationStruct);
  if (error) {
    res.status(400).json({
      code: 400,
      message: "요청 형식이 올바르지 않습니다.",
      data: null,
    });
    return;
  }

  const { userId, type, content, referenceId } = req.body;

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
    type: type as NOTIFICATION_TYPE,
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
};
