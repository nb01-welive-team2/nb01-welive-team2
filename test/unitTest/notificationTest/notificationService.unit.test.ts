import {
  notifySuperAdminsOfAdminSignup,
  notifyAdminsOfResidentSignup,
  notifyAdminsOfNewComplaint,
  notifyResidentOfComplaintStatusChange,
  notifyResidentsOfNewNotice,
  updateNotification,
  countUnreadNotifications,
  markAllNotificationsAsRead,
} from "@/services/notificationService";
import {
  createNotificationInDb,
  updateNotificationById,
  countUnreadNotificationsInDb,
  markAllNotificationsAsReadInDb,
} from "@/repositories/notificationRepository";
import { NOTIFICATION_TYPE, USER_ROLE } from "@prisma/client";
import { prisma } from "@/lib/prisma";

jest.mock("@/repositories/notificationRepository");
jest.mock("@/sockets/registerSocketServer");
jest.mock("@/lib/prisma", () => ({
  prisma: {
    users: {
      findMany: jest.fn(),
    },
  },
}));

const mockEmit = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (getIO as jest.Mock).mockReturnValue({
    to: () => ({ emit: mockEmit }),
  });
});

describe("notificationService - notifySuperAdminsOfAdminSignup", () => {
  const mockAdmins = [{ id: "admin-1" }, { id: "admin-2" }];

  beforeEach(() => {
    (prisma.users.findMany as jest.Mock).mockResolvedValue(mockAdmins);
    (createNotificationInDb as jest.Mock).mockImplementation(({ userId }) => ({
      id: `notification-${userId}`,
      userId,
      notificationType: NOTIFICATION_TYPE.회원가입신청,
      content: "신규 관리자 회원가입 신청이 도착했습니다.",
      isChecked: false,
      notifiedAt: new Date(),
      complaintId: null,
      noticeId: null,
      pollId: null,
    }));
  });

  it("슈퍼 어드민에게 알림 전송", async () => {
    await notifySuperAdminsOfAdminSignup();

    expect(prisma.users.findMany).toHaveBeenCalledWith({
      where: { role: USER_ROLE.SUPER_ADMIN },
    });

    for (const admin of mockAdmins) {
      expect(createNotificationInDb).toHaveBeenCalledWith({
        userId: admin.id,
        type: NOTIFICATION_TYPE.회원가입신청,
        content: "신규 관리자 회원가입 신청이 도착했습니다.",
      });

      expect(mockEmit).toHaveBeenCalledWith(
        "notification",
        expect.objectContaining({
          userId: admin.id,
          type: NOTIFICATION_TYPE.회원가입신청,
        })
      );
    }
  });
});

describe("notificationService - notifyAdminsOfResidentSignup", () => {
  const mockAdmins = [{ id: "admin-1" }, { id: "admin-2" }];

  beforeEach(() => {
    (prisma.users.findMany as jest.Mock).mockResolvedValue(mockAdmins);
    (createNotificationInDb as jest.Mock).mockImplementation(({ userId }) => ({
      id: `noti-${userId}`,
      userId,
      notificationType: NOTIFICATION_TYPE.회원가입신청,
      content: "신규 입주민 회원가입 신청이 도착했습니다.",
      isChecked: false,
      notifiedAt: new Date(),
      complaintId: null,
      noticeId: null,
      pollId: null,
    }));
  });

  it("관리자에게 알림 전송", async () => {
    await notifyAdminsOfResidentSignup();

    expect(prisma.users.findMany).toHaveBeenCalledWith({
      where: { role: USER_ROLE.ADMIN },
    });

    for (const admin of mockAdmins) {
      expect(createNotificationInDb).toHaveBeenCalledWith({
        userId: admin.id,
        type: NOTIFICATION_TYPE.회원가입신청,
        content: "신규 입주민 회원가입 신청이 도착했습니다.",
      });

      expect(mockEmit).toHaveBeenCalledWith(
        "notification",
        expect.objectContaining({
          userId: admin.id,
          type: NOTIFICATION_TYPE.회원가입신청,
        })
      );
    }
  });
});

describe("notificationService - notifyAdminsOfNewComplaint", () => {
  const mockAdmins = [{ id: "admin-1" }];
  const mockComplaintId = "complaint-123";

  beforeEach(() => {
    (prisma.users.findMany as jest.Mock).mockResolvedValue(mockAdmins);
    (createNotificationInDb as jest.Mock).mockImplementation(({ userId }) => ({
      id: `noti-${userId}`,
      userId,
      notificationType: NOTIFICATION_TYPE.민원_등록,
      content: "새로운 민원이 등록되었습니다.",
      isChecked: false,
      notifiedAt: new Date(),
      complaintId: mockComplaintId,
      noticeId: null,
      pollId: null,
    }));
  });

  it("관리자에게 민원 알림 전송", async () => {
    await notifyAdminsOfNewComplaint(mockComplaintId);

    expect(createNotificationInDb).toHaveBeenCalledWith({
      userId: "admin-1",
      type: NOTIFICATION_TYPE.민원_등록,
      content: "새로운 민원이 등록되었습니다.",
      referenceId: mockComplaintId,
    });

    expect(mockEmit).toHaveBeenCalledWith(
      "notification",
      expect.objectContaining({
        userId: "admin-1",
        referenceId: mockComplaintId,
        type: NOTIFICATION_TYPE.민원_등록,
      })
    );
  });
});

describe("notificationService - notifyResidentOfComplaintStatusChange", () => {
  const userId = "resident-1";
  const complaintId = "complaint-456";

  beforeEach(() => {
    (createNotificationInDb as jest.Mock).mockResolvedValue({
      id: "noti-complaint",
      userId,
      notificationType: NOTIFICATION_TYPE.COMPLAINT_RESOLVED,
      content: "등록한 민원이 처리되었습니다.",
      isChecked: false,
      notifiedAt: new Date(),
      complaintId,
      noticeId: null,
      pollId: null,
    });
  });

  it("입주민에게 민원 상태 알림 전송", async () => {
    await notifyResidentOfComplaintStatusChange(userId, complaintId);

    expect(createNotificationInDb).toHaveBeenCalledWith({
      userId,
      type: NOTIFICATION_TYPE.COMPLAINT_RESOLVED,
      content: "등록한 민원이 처리되었습니다.",
      referenceId: complaintId,
    });

    expect(mockEmit).toHaveBeenCalledWith(
      "notification",
      expect.objectContaining({
        userId,
        referenceId: complaintId,
        type: NOTIFICATION_TYPE.COMPLAINT_RESOLVED,
      })
    );
  });
});

describe("notificationService - notifyResidentsOfNewNotice", () => {
  const mockResidents = [{ id: "resident-1" }, { id: "resident-2" }];
  const noticeId = "notice-999";

  beforeEach(() => {
    (prisma.users.findMany as jest.Mock).mockResolvedValue(mockResidents);
    (createNotificationInDb as jest.Mock).mockImplementation(({ userId }) => ({
      id: `noti-${userId}`,
      userId,
      notificationType: NOTIFICATION_TYPE.공지_등록,
      content: "새로운 공지사항이 등록되었습니다.",
      isChecked: false,
      notifiedAt: new Date(),
      complaintId: null,
      noticeId,
      pollId: null,
    }));
  });

  it("입주민 모두에게 공지 알림 전송", async () => {
    await notifyResidentsOfNewNotice(noticeId);

    for (const resident of mockResidents) {
      expect(createNotificationInDb).toHaveBeenCalledWith({
        userId: resident.id,
        type: NOTIFICATION_TYPE.공지_등록,
        content: "새로운 공지사항이 등록되었습니다.",
        referenceId: noticeId,
      });

      expect(mockEmit).toHaveBeenCalledWith(
        "notification",
        expect.objectContaining({
          userId: resident.id,
          referenceId: noticeId,
          type: NOTIFICATION_TYPE.공지_등록,
        })
      );
    }
  });
});

describe("notificationService - updateNotification", () => {
  it("읽음 처리", async () => {
    const mockUpdated = {
      id: "noti-1",
      userId: "user-1",
      notificationType: NOTIFICATION_TYPE.공지_등록,
      content: "공지입니다",
      isChecked: true,
      notifiedAt: new Date(),
      complaintId: null,
      noticeId: null,
      pollId: null,
    };

    (updateNotificationById as jest.Mock).mockResolvedValue(mockUpdated);

    const result = await updateNotification("noti-1", true);
    expect(updateNotificationById).toHaveBeenCalledWith("noti-1", true);
    expect(result).toEqual(mockUpdated);
  });
});

describe("notificationService", () => {
  it("읽지 않은 알림 수 조회", async () => {
    (countUnreadNotificationsInDb as jest.Mock).mockResolvedValue(5);
    const result = await countUnreadNotifications("user-1");
    expect(result).toBe(5);
  });

  it("모든 알림 읽음 처리", async () => {
    await markAllNotificationsAsRead("user-1");
    expect(markAllNotificationsAsReadInDb).toHaveBeenCalledWith("user-1");
  });
});
