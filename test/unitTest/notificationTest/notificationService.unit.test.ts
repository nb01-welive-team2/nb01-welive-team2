import {
  createNotification,
  notifySuperAdminsOfAdminSignup,
  notifyAdminsOfResidentSignup,
  notifyAdminsOfNewComplaint,
  notifyResidentOfComplaintStatusChange,
  notifyResidentsOfNewNotice,
  getNotifications,
  getNotificationById,
  updateNotification,
} from "@/services/notificationService";
import { getIO } from "@/sockets/registerSocketServer";
import {
  createNotificationInDb,
  findNotifications,
  findNotificationById,
  updateNotificationById,
} from "@/repositories/notificationRepository";
import { NOTIFICATION_TYPE, USER_ROLE } from "@prisma/client";
import { CreateNotificationRequestDto } from "@/dto/notificationDto";
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

describe("notificationService - createNotification", () => {
  const mockNotification = {
    id: "noti-123",
    userId: "user-1",
    notificationType: NOTIFICATION_TYPE.회원가입신청,
    content: "테스트 알림입니다.",
    isChecked: false,
    notifiedAt: new Date(),
    complaintId: null,
    noticeId: null,
    pollId: null,
  };

  const mockEmit = jest.fn();

  beforeEach(() => {
    (createNotificationInDb as jest.Mock).mockResolvedValue(mockNotification);
    (getIO as jest.Mock).mockReturnValue({
      to: () => ({ emit: mockEmit }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("알림 생성 후 실시간 전송", async () => {
    const input: CreateNotificationRequestDto = {
      userId: "user-1",
      type: NOTIFICATION_TYPE.회원가입신청,
      content: "테스트 알림입니다.",
    };

    const result = await createNotification(input);

    expect(createNotificationInDb).toHaveBeenCalledWith(input);

    expect(mockEmit).toHaveBeenCalledWith("notification", {
      id: mockNotification.id,
      userId: mockNotification.userId,
      type: mockNotification.notificationType,
      content: mockNotification.content,
      isRead: mockNotification.isChecked,
      referenceId: null,
      createdAt: mockNotification.notifiedAt,
      updatedAt: null,
    });

    expect(result).toEqual(mockNotification);
  });
});

describe("notificationService - notifySuperAdminsOfAdminSignup", () => {
  const mockEmit = jest.fn();
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
    (getIO as jest.Mock).mockReturnValue({
      to: () => ({ emit: mockEmit }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("알림 생성 후 슈퍼 어드민에게 전송", async () => {
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
  const mockEmit = jest.fn();

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

    (getIO as jest.Mock).mockReturnValue({
      to: () => ({ emit: mockEmit }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("알림 생성 후 관리자에게 전송", async () => {
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
  const mockAdmins = [{ id: "admin-1" }, { id: "admin-2" }];
  const mockComplaintId = "complaint-123";
  const mockEmit = jest.fn();

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

    (getIO as jest.Mock).mockReturnValue({
      to: () => ({ emit: mockEmit }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("관리자에게 민원 알림을 전송해야 한다", async () => {
    await notifyAdminsOfNewComplaint(mockComplaintId);

    expect(prisma.users.findMany).toHaveBeenCalledWith({
      where: { role: USER_ROLE.ADMIN },
    });

    for (const admin of mockAdmins) {
      expect(createNotificationInDb).toHaveBeenCalledWith({
        userId: admin.id,
        type: NOTIFICATION_TYPE.민원_등록,
        content: "새로운 민원이 등록되었습니다.",
        referenceId: mockComplaintId,
      });

      expect(mockEmit).toHaveBeenCalledWith(
        "notification",
        expect.objectContaining({
          userId: admin.id,
          type: NOTIFICATION_TYPE.민원_등록,
          referenceId: mockComplaintId,
        })
      );
    }
  });
});

describe("notificationService - notifyResidentOfComplaintStatusChange", () => {
  const userId = "resident-1";
  const complaintId = "complaint-456";
  const mockEmit = jest.fn();

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

    (getIO as jest.Mock).mockReturnValue({
      to: () => ({ emit: mockEmit }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("민원 상태 변경 시 해당 입주민에게 알림을 전송해야 한다", async () => {
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
        type: NOTIFICATION_TYPE.COMPLAINT_RESOLVED,
        referenceId: complaintId,
      })
    );
  });
});

describe("notificationService - notifyResidentsOfNewNotice", () => {
  const mockResidents = [{ id: "resident-1" }, { id: "resident-2" }];
  const noticeId = "notice-999";
  const mockEmit = jest.fn();

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

    (getIO as jest.Mock).mockReturnValue({
      to: () => ({ emit: mockEmit }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("모든 입주민에게 공지 알림을 전송해야 한다", async () => {
    await notifyResidentsOfNewNotice(noticeId);

    expect(prisma.users.findMany).toHaveBeenCalledWith({
      where: { role: USER_ROLE.USER },
    });

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
          type: NOTIFICATION_TYPE.공지_등록,
          referenceId: noticeId,
        })
      );
    }
  });
});

describe("notificationService - getNotifications", () => {
  const mockNotifications = [
    {
      id: "noti-1",
      userId: "user-1",
      notificationType: "공지_등록",
      content: "공지입니다",
      isChecked: false,
      notifiedAt: new Date(),
      complaintId: null,
      noticeId: null,
      pollId: null,
    },
  ];

  beforeEach(() => {
    (findNotifications as jest.Mock).mockResolvedValue(mockNotifications);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("userId만 전달해도 알림을 조회할 수 있다", async () => {
    const result = await getNotifications("user-1");

    expect(findNotifications).toHaveBeenCalledWith("user-1", undefined);
    expect(result).toEqual(mockNotifications);
  });

  it("userId와 isRead가 모두 전달되면 조건 포함 조회된다", async () => {
    const result = await getNotifications("user-1", true);

    expect(findNotifications).toHaveBeenCalledWith("user-1", true);
    expect(result).toEqual(mockNotifications);
  });
});

describe("notificationService - getNotificationById", () => {
  const mockNotification = {
    id: "noti-1",
    userId: "user-1",
    notificationType: "공지_등록",
    content: "공지입니다",
    isChecked: false,
    notifiedAt: new Date(),
    complaintId: null,
    noticeId: null,
    pollId: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ID가 존재하는 경우 알림을 반환해야 한다", async () => {
    (findNotificationById as jest.Mock).mockResolvedValue(mockNotification);

    const result = await getNotificationById("noti-1");

    expect(findNotificationById).toHaveBeenCalledWith("noti-1");
    expect(result).toEqual(mockNotification);
  });

  it("ID가 존재하지 않는 경우 null을 반환해야 한다", async () => {
    (findNotificationById as jest.Mock).mockResolvedValue(null);

    const result = await getNotificationById("noti-x");

    expect(findNotificationById).toHaveBeenCalledWith("noti-x");
    expect(result).toBeNull();
  });
});

describe("notificationService - updateNotification", () => {
  const mockUpdatedNotification = {
    id: "noti-1",
    userId: "user-1",
    notificationType: "공지_등록",
    content: "공지입니다",
    isChecked: true,
    notifiedAt: new Date(),
    complaintId: null,
    noticeId: null,
    pollId: null,
  };

  beforeEach(() => {
    (updateNotificationById as jest.Mock).mockResolvedValue(
      mockUpdatedNotification
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("알림을 읽음 처리하고 반환해야 한다", async () => {
    const result = await updateNotification("noti-1", true);

    expect(updateNotificationById).toHaveBeenCalledWith("noti-1", true);
    expect(result).toEqual(mockUpdatedNotification);
  });
});
