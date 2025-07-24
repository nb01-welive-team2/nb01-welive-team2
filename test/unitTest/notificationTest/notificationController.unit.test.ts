import {
  sseNotificationHandler,
  patchNotificationHandler,
  getUnreadNotificationCountHandler,
  markAllNotificationsAsReadHandler,
} from "@/controllers/notificationController";
import {
  getNotifications,
  updateNotification,
  countUnreadNotifications,
  markAllNotificationsAsRead,
} from "@/services/notificationService";
import { sseConnections } from "@/lib/sseHandler";
import { NOTIFICATION_TYPE } from "@prisma/client";

jest.mock("@/services/notificationService");

describe("notificationController", () => {
  afterEach(() => {
    jest.clearAllMocks();
    sseConnections.clear();
  });

  describe("sseNotificationHandler", () => {
    it("SSE 연결 시 헤더 설정, sseConnections 저장 및 초기 알림 전송", async () => {
      const mockRes = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as any;
      const mockReq = {
        user: { userId: "user-1" },
        on: jest.fn(),
        query: { closeAfter: "100" },
      } as any;

      (getNotifications as jest.Mock).mockResolvedValue([
        {
          id: "n-1",
          content: "알림 내용",
          notificationType: NOTIFICATION_TYPE.공지_등록,
          notifiedAt: new Date(),
          isChecked: false,
          complaintId: null,
          noticeId: "notice-1",
          pollId: null,
        },
      ]);

      await sseNotificationHandler(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "text/event-stream"
      );
      expect(sseConnections.has("user-1")).toBe(true);
      expect(mockRes.write).toHaveBeenCalledWith(
        expect.stringContaining("data:")
      );
    });

    it("연결 종료 시 cleanup 수행", async () => {
      const mockRes = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as any;
      const mockReq = {
        user: { userId: "user-1" },
        on: jest.fn(),
        query: { closeAfter: "1000" },
      } as any;

      (getNotifications as jest.Mock).mockResolvedValue([]);

      await sseNotificationHandler(mockReq, mockRes);

      const closeHandler = mockReq.on.mock.calls.find(
        (c: string[]) => c[0] === "close"
      )[1];

      closeHandler();

      expect(sseConnections.has("user-1")).toBe(false);
      expect(mockRes.end).toHaveBeenCalled();
    });
  });

  describe("patchNotificationHandler", () => {
    it("알림 읽음 처리 성공 시 200 응답", async () => {
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
        params: { notificationId: "9b5c0b74-6a40-4e2b-a5c1-8d1f6f7d3d6b" },
        body: { isRead: true },
      } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      await patchNotificationHandler(req, res);

      expect(updateNotification).toHaveBeenCalledWith(
        "9b5c0b74-6a40-4e2b-a5c1-8d1f6f7d3d6b",
        true
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 200,
          message: "알림 상태가 업데이트되었습니다.",
          data: expect.objectContaining({
            id: expect.any(String), // ✅ 고정 UUID 대신 any String으로 체크
            isRead: true,
          }),
        })
      );
    });
  });

  describe("getUnreadNotificationCountHandler", () => {
    it("읽지 않은 알림 개수 조회 성공", async () => {
      (countUnreadNotifications as jest.Mock).mockResolvedValue(5);

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
        data: { count: 5 },
      });
    });
  });

  describe("markAllNotificationsAsReadHandler", () => {
    it("모든 알림 읽음 처리 성공", async () => {
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
