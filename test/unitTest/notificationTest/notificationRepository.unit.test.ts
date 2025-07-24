import {
  findNotifications,
  updateNotificationById,
  createNotificationInDb,
  countUnreadNotificationsInDb,
  markAllNotificationsAsReadInDb,
} from "@/repositories/notificationRepository";
import { prisma } from "@/lib/prisma";
import { NOTIFICATION_TYPE } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    notifications: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

describe("notificationRepository", () => {
  const mockNotification = {
    id: "n-1",
    userId: "u-1",
    notificationType: NOTIFICATION_TYPE.공지_등록,
    content: "공지 등록됨",
    isChecked: false,
    notifiedAt: new Date(),
    complaintId: null,
    noticeId: null,
    pollId: null,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findNotifications", () => {
    it("읽음 필터 없이 유저 알림 전체 조회", async () => {
      (prisma.notifications.findMany as jest.Mock).mockResolvedValue([
        mockNotification,
      ]);

      const result = await findNotifications("u-1");

      expect(prisma.notifications.findMany).toHaveBeenCalledWith({
        where: { userId: "u-1" },
        orderBy: { notifiedAt: "desc" },
      });

      expect(result).toEqual([mockNotification]);
    });

    it("읽지 않은 알림만 필터링", async () => {
      await findNotifications("u-1", false);

      expect(prisma.notifications.findMany).toHaveBeenCalledWith({
        where: { userId: "u-1", isChecked: false },
        orderBy: { notifiedAt: "desc" },
      });
    });
  });

  describe("updateNotificationById", () => {
    it("알림 읽음 처리 업데이트", async () => {
      (prisma.notifications.update as jest.Mock).mockResolvedValue({
        ...mockNotification,
        isChecked: true,
      });

      const result = await updateNotificationById("n-1", true);

      expect(prisma.notifications.update).toHaveBeenCalledWith({
        where: { id: "n-1" },
        data: { isChecked: true },
      });

      expect(result.isChecked).toBe(true);
    });
  });

  describe("createNotificationInDb", () => {
    it("기본 알림 생성", async () => {
      (prisma.notifications.create as jest.Mock).mockResolvedValue(
        mockNotification
      );

      const result = await createNotificationInDb({
        userId: "u-1",
        type: NOTIFICATION_TYPE.공지_등록,
        content: "공지 등록됨",
      });

      expect(prisma.notifications.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: "u-1" } }, // ✅ 수정
          notificationType: NOTIFICATION_TYPE.공지_등록,
          content: "공지 등록됨",
          isChecked: false,
        },
      });

      expect(result).toEqual(mockNotification);
    });

    it("민원 ID가 있으면 complaintId에 포함됨", async () => {
      await createNotificationInDb({
        userId: "u-1",
        type: NOTIFICATION_TYPE.민원_등록,
        content: "민원 생성됨",
        referenceId: "complaint-123",
      });

      expect(prisma.notifications.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user: { connect: { id: "u-1" } }, // ✅ 관계 연결 확인
          complaint: { connect: { id: "complaint-123" } }, // ✅ 수정된 부분
        }),
      });
    });
  });

  describe("countUnreadNotificationsInDb", () => {
    beforeEach(() => {
      (prisma.notifications.count as jest.Mock).mockResolvedValue(4);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should return the count of unread notifications for a user", async () => {
      const result = await countUnreadNotificationsInDb("user-123");

      expect(result).toBe(4);
      expect(prisma.notifications.count).toHaveBeenCalledWith({
        where: {
          userId: "user-123",
          isChecked: false,
        },
      });
    });
  });

  describe("markAllNotificationsAsReadInDb", () => {
    beforeEach(() => {
      (prisma.notifications.updateMany as jest.Mock).mockResolvedValue(
        undefined
      );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should mark all unread notifications as read for a user", async () => {
      await markAllNotificationsAsReadInDb("user-456");

      expect(prisma.notifications.updateMany).toHaveBeenCalledWith({
        where: {
          userId: "user-456",
          isChecked: false,
        },
        data: {
          isChecked: true,
        },
      });
    });
  });
});
