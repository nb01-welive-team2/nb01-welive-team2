import {
  createNotice,
  getNoticeList,
  getNotice,
  editNotice,
  removeNotice,
} from "@/controllers/noticeController";
import noticeService from "@/services/noticeService";
import { USER_ROLE } from "@prisma/client";
import ForbiddenError from "@/errors/ForbiddenError";
import * as struct from "superstruct";
import registerSuccessMessage from "@/lib/responseJson/registerSuccess";
import removeSuccessMessage from "@/lib/responseJson/removeSuccess";
import {
  ResponseNoticeDTO,
  ResponseNoticeCommentDTO,
  ResponseNoticeListDTO,
} from "@/dto/noticeDTO";

jest.mock("@/services/noticeService");
jest.mock("superstruct");
jest.mock("@/lib/responseJson/registerSuccess");
jest.mock("@/lib/responseJson/removeSuccess");

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const mockUser = (role: USER_ROLE, userId = 1) => ({
  user: {
    role,
    userId,
  },
});

describe("Notice Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createNotice", () => {
    it("should create notice if user is admin", async () => {
      (struct.create as jest.Mock).mockReturnValue({
        title: "test",
        content: "test",
      });
      const req: any = { body: {}, ...mockUser(USER_ROLE.ADMIN) };
      const res = mockResponse();

      await createNotice(req, res);

      expect(noticeService.createNotice).toHaveBeenCalledWith(
        { title: "test", content: "test" },
        1
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(expect.any(registerSuccessMessage));
    });

    it("should throw ForbiddenError if not admin", async () => {
      const req: any = { body: {}, ...mockUser(USER_ROLE.USER) };
      await expect(createNotice(req, mockResponse())).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe("getNoticeList", () => {
    it("should return notice list if not SUPER_ADMIN", async () => {
      (struct.create as jest.Mock).mockReturnValue({ page: 1 });
      const mockNoticeList = [
        {
          id: "e1b0f1fa-c8f3-4b17-8d2d-f0e5678a1234",
          isPinned: false,
          category: "MAINTENANCE",
          viewCount: 123,
          userId: "a3d1234b-5678-4c9f-a123-b4567d89ef01",
          title: "승강기 정기점검 안내",
          content: "매월 실시하는 승강기 정기점검으로 인해 ...",
          startDate: new Date("2025-06-01T00:00:00Z"),
          endDate: new Date("2025-06-10T00:00:00Z"),
          createdAt: new Date("2025-05-25T09:00:00Z"),
          updatedAt: new Date("2025-05-25T09:00:00Z"),
          user: {
            username: "adminuser",
          },
          _count: {
            NoticeComments: 5,
          },
        },
        {
          id: "f2d1e2fb-d9f4-5c28-9e3d-a1b2c3d4e5f6",
          isPinned: true,
          category: "EVENT",
          viewCount: 45,
          userId: "b4c5678d-1234-5e6f-8g9h-i0jklmn12345",
          title: "입주민 대상 문화 행사 안내",
          content: "이번 주말에 아파트 단지 내에서 문화 행사가 있습니다.",
          startDate: new Date("2025-07-15T00:00:00Z"),
          endDate: new Date("2025-07-16T00:00:00Z"),
          createdAt: new Date("2025-07-01T12:00:00Z"),
          updatedAt: new Date("2025-07-01T12:00:00Z"),
          user: {
            username: "eventmanager",
          },
          _count: {
            NoticeComments: 12,
          },
        },
      ];

      (noticeService.getNoticeList as jest.Mock).mockResolvedValue({
        totalCount: mockNoticeList.length,
        notices: mockNoticeList,
      });

      const req: any = { query: {}, ...mockUser(USER_ROLE.ADMIN) };
      const res = mockResponse();

      await getNoticeList(req, res);

      expect(res.send).toHaveBeenCalledWith(expect.any(ResponseNoticeListDTO));
    });

    it("should throw ForbiddenError if SUPER_ADMIN", async () => {
      const req: any = { query: {}, ...mockUser(USER_ROLE.SUPER_ADMIN) };
      await expect(getNoticeList(req, mockResponse())).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe("getNotice", () => {
    it("should return notice if not SUPER_ADMIN", async () => {
      (struct.create as jest.Mock).mockReturnValue({ noticeId: 123 });
      const mockNotice = {
        id: "notice-uuid-1234",
        isPinned: true,
        category: "MAINTENANCE",
        viewCount: 100,
        userId: "user-uuid-1111",
        title: "승강기 점검 안내",
        content: "승강기 정기 점검이 아래 일정에 따라 진행됩니다.",
        startDate: new Date("2025-06-01T00:00:00Z"),
        endDate: new Date("2025-06-10T00:00:00Z"),
        createdAt: new Date("2025-05-20T10:00:00Z"),
        updatedAt: new Date("2025-05-20T10:00:00Z"),

        user: {
          username: "adminuser",
          apartmentInfo: {
            id: "apt-uuid-001",
          },
        },

        NoticeComments: [
          {
            id: "comment-uuid-1",
            noticeId: "notice-uuid-1234",
            userId: "user-uuid-2222",
            content: "점검일 잘 확인했습니다.",
            createdAt: new Date("2025-05-21T09:00:00Z"),
            updatedAt: new Date("2025-05-21T09:00:00Z"),
            user: {
              username: "resident001",
            },
          },
          {
            id: "comment-uuid-2",
            noticeId: "notice-uuid-1234",
            userId: "user-uuid-3333",
            content: "그 시간에 엘리베이터 못 쓰는 거죠?",
            createdAt: new Date("2025-05-21T11:30:00Z"),
            updatedAt: new Date("2025-05-21T11:30:00Z"),
            user: {
              username: "resident002",
            },
          },
        ],
      };

      (noticeService.getNotice as jest.Mock).mockResolvedValue(mockNotice);

      const req: any = { params: {}, ...mockUser(USER_ROLE.USER) };
      const res = mockResponse();

      await getNotice(req, res);

      expect(res.send).toHaveBeenCalledWith(
        expect.any(ResponseNoticeCommentDTO)
      );
    });

    it("should throw ForbiddenError if SUPER_ADMIN", async () => {
      const req: any = { params: {}, ...mockUser(USER_ROLE.SUPER_ADMIN) };
      await expect(getNotice(req, mockResponse())).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe("editNotice", () => {
    it("should edit notice if admin", async () => {
      (struct.create as jest.Mock).mockImplementationOnce(() => ({
        title: "updated",
      }));
      (struct.create as jest.Mock).mockImplementationOnce(() => ({
        noticeId: 5,
      }));
      const updatedNotice = {
        id: "notice-uuid-1234",
        isPinned: false,
        category: "EVENT", // NOTICE_CATEGORY enum 값 중 하나
        viewCount: 105,
        userId: "user-uuid-1111",
        title: "단지 문화행사 변경 안내",
        content: "행사 일정이 6월 20일로 변경되었습니다.",
        startDate: new Date("2025-06-20T00:00:00Z"),
        endDate: new Date("2025-06-21T00:00:00Z"),
        createdAt: new Date("2025-05-10T09:00:00Z"),
        updatedAt: new Date("2025-06-18T15:30:00Z"), // 업데이트 시점

        user: {
          username: "adminuser",
        },

        _count: {
          NoticeComments: 3,
        },
      };

      (noticeService.updateNotice as jest.Mock).mockResolvedValue(
        updatedNotice
      );

      const req: any = { body: {}, params: {}, ...mockUser(USER_ROLE.ADMIN) };
      const res = mockResponse();

      await editNotice(req, res);

      expect(noticeService.updateNotice).toHaveBeenCalledWith(5, {
        title: "updated",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.any(ResponseNoticeDTO));
    });

    it("should throw ForbiddenError if not admin", async () => {
      const req: any = { body: {}, params: {}, ...mockUser(USER_ROLE.USER) };
      await expect(editNotice(req, mockResponse())).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe("removeNotice", () => {
    it("should remove notice if admin", async () => {
      (struct.create as jest.Mock).mockReturnValue({ noticeId: 7 });

      const req: any = { params: {}, ...mockUser(USER_ROLE.ADMIN) };
      const res = mockResponse();

      await removeNotice(req, res);

      expect(noticeService.removeNotice).toHaveBeenCalledWith(7);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.any(removeSuccessMessage));
    });

    it("should throw ForbiddenError if not admin", async () => {
      const req: any = { params: {}, ...mockUser(USER_ROLE.USER) };
      await expect(removeNotice(req, mockResponse())).rejects.toThrow(
        ForbiddenError
      );
    });
  });
});
