import {
  getNotificationsHandler,
  getNotificationByIdHandler,
  patchNotificationHandler,
  createNotificationHandler,
  getUnreadNotificationCountHandler,
  markAllNotificationsAsReadHandler,
} from "@/controllers/notificationController";

import {
  getNotifications,
  getNotificationById,
  updateNotification,
  createNotification,
  countUnreadNotifications,
  markAllNotificationsAsRead,
} from "@/services/notificationService";

import { NOTIFICATION_TYPE } from "@prisma/client";

jest.mock("@/services/notificationService");

describe("notificationController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getNotificationsHandler", () => {
    it("userId 없이 요청 시 400 응답", async () => {
      const req = { query: {} } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await getNotificationsHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        code: 400,
        message: "요청 형식이 올바르지 않습니다.",
        data: null,
      });
    });

    it("정상 요청 시 서비스 호출 및 200 응답", async () => {
      const mockNotifications = [
        {
          id: "n-1",
          userId: "u-1",
          notificationType: NOTIFICATION_TYPE.공지_등록,
          content: "공지입니다",
          isChecked: false,
          notifiedAt: new Date(),
          complaintId: null,
          noticeId: null,
          pollId: null,
        },
      ];

      (getNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      const req = { query: { userId: "u-1", isRead: "false" } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await getNotificationsHandler(req, res);

      expect(getNotifications).toHaveBeenCalledWith("u-1", false);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe("getNotificationByIdHandler", () => {
    it("없는 알림일 경우 404 응답", async () => {
      (getNotificationById as jest.Mock).mockResolvedValue(null);

      const req = { params: { id: "n-x" } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await getNotificationByIdHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("patchNotificationHandler", () => {
    it("isRead가 boolean이 아니면 400 응답", async () => {
      const req = {
        params: { id: "n-1" },
        body: { isRead: "true" },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await patchNotificationHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("정상 요청 시 서비스 호출 및 200 응답", async () => {
      (updateNotification as jest.Mock).mockResolvedValue({
        id: "n-1",
        userId: "u-1",
        notificationType: NOTIFICATION_TYPE.공지_등록,
        content: "공지입니다",
        isChecked: true,
        notifiedAt: new Date(),
        complaintId: null,
        noticeId: null,
        pollId: null,
      });

      const req = {
        params: { id: "n-1" },
        body: { isRead: true },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await patchNotificationHandler(req, res);

      expect(updateNotification).toHaveBeenCalledWith("n-1", true);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("createNotificationHandler", () => {
    it("필수값 누락 시 400", async () => {
      const req = {
        body: { userId: "u-1", content: "내용만 있음" },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await createNotificationHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("유효하지 않은 enum 값일 경우 400", async () => {
      const req = {
        body: {
          userId: "u-1",
          type: "WRONG_ENUM",
          content: "내용",
        },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await createNotificationHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("정상 요청 시 201 응답", async () => {
      (createNotification as jest.Mock).mockResolvedValue({
        id: "n-1",
        userId: "u-1",
        notificationType: NOTIFICATION_TYPE.공지_등록,
        content: "공지입니다",
        isChecked: false,
        notifiedAt: new Date(),
        complaintId: null,
        noticeId: null,
        pollId: null,
      });

      const req = {
        body: {
          userId: "u-1",
          type: NOTIFICATION_TYPE.공지_등록,
          content: "공지입니다",
        },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await createNotificationHandler(req, res);

      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "u-1",
          type: NOTIFICATION_TYPE.공지_등록,
          content: "공지입니다",
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("getUnreadNotificationCountHandler", () => {
    it("읽지 않은 알림 개수 조회 성공 시 200 응답", async () => {
      (countUnreadNotifications as jest.Mock).mockResolvedValue(3);

      const req = { user: { id: "u-123" } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await getUnreadNotificationCountHandler(req, res);

      expect(countUnreadNotifications).toHaveBeenCalledWith("u-123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: "읽지 않은 알림 개수 조회에 성공했습니다.",
        data: { count: 3 },
      });
    });
  });

  describe("markAllNotificationsAsReadHandler", () => {
    it("모든 알림 읽음 처리 성공 시 200 응답", async () => {
      (markAllNotificationsAsRead as jest.Mock).mockResolvedValue(undefined);

      const req = { user: { id: "u-123" } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await markAllNotificationsAsReadHandler(req, res);

      expect(markAllNotificationsAsRead).toHaveBeenCalledWith("u-123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: "모든 알림이 읽음 처리되었습니다.",
        data: null,
      });
    });
  });
});
