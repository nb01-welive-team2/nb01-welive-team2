import {
  patchNotificationHandler,
  getUnreadNotificationCountHandler,
  markAllNotificationsAsReadHandler,
} from "@/controllers/notificationController";
import {
  updateNotification,
  countUnreadNotifications,
  markAllNotificationsAsRead,
} from "@/services/notificationService";
import { NOTIFICATION_TYPE } from "@prisma/client";

jest.mock("@/services/notificationService");

describe("notificationController", () => {
  afterEach(() => {
    jest.clearAllMocks();
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
