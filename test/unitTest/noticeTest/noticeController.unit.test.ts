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

const mockUser = (
  role: USER_ROLE,
  userId = "user-uuid",
  apartmentId = "apt-uuid"
) => ({
  user: {
    role,
    userId,
    apartmentId,
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
        startDate: "2025-07-10",
        endDate: "2025-07-20",
      });
      const req: any = { body: {}, ...mockUser(USER_ROLE.ADMIN) };
      const res = mockResponse();

      await createNotice(req, res);

      expect(noticeService.createNotice).toHaveBeenCalledWith(
        {
          title: "test",
          content: "test",
          startDate: "2025-07-10",
          endDate: "2025-07-20",
        },
        "user-uuid",
        "apt-uuid",
        true // isEvent based on startDate & endDate
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(expect.any(registerSuccessMessage));
    });
  });

  describe("getNoticeList", () => {
    it("should return notice list if not SUPER_ADMIN", async () => {
      (struct.create as jest.Mock).mockReturnValue({ page: 1, limit: 10 });

      const mockNoticeList = [
        {
          id: "notice-1",
          title: "Notice 1",
          category: "MAINTENANCE",
          isPinned: false,
          viewCount: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { username: "admin1" },
          _count: { NoticeComments: 2 },
        },
        {
          id: "notice-2",
          title: "Notice 2",
          category: "EVENT",
          isPinned: true,
          viewCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { username: "admin2" },
          _count: { NoticeComments: 0 },
        },
      ];

      (noticeService.getNoticeList as jest.Mock).mockResolvedValue({
        totalCount: mockNoticeList.length,
        notices: mockNoticeList,
      });

      const req: any = { query: {}, ...mockUser(USER_ROLE.ADMIN) };
      const res = mockResponse();

      await getNoticeList(req, res);

      expect(noticeService.getNoticeList).toHaveBeenCalledWith("apt-uuid", {
        page: 1,
        limit: 10,
      });
      expect(res.send).toHaveBeenCalledWith(expect.any(ResponseNoticeListDTO));
    });
  });

  describe("getNotice", () => {
    it("should return notice if not SUPER_ADMIN", async () => {
      (struct.create as jest.Mock).mockReturnValue({
        noticeId: "notice-uuid-1234",
      });

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
          username: "adminuser", // ✅ 추가
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
  });

  describe("editNotice", () => {
    it("should edit notice if admin", async () => {
      (struct.create as jest.Mock)
        .mockImplementationOnce(() => ({
          title: "updated",
          startDate: "2025-07-15",
          endDate: "2025-07-20",
        })) // body
        .mockImplementationOnce(() => ({ noticeId: "notice-uuid" })); // params

      const updatedNotice = {
        id: "notice-uuid-1234",
        isPinned: false,
        category: "EVENT",
        viewCount: 105,
        userId: "user-uuid-1111",
        title: "단지 문화행사 변경 안내",
        content: "행사 일정이 6월 20일로 변경되었습니다.",
        startDate: new Date("2025-06-20T00:00:00Z"),
        endDate: new Date("2025-06-21T00:00:00Z"),
        createdAt: new Date("2025-05-10T09:00:00Z"),
        updatedAt: new Date("2025-06-18T15:30:00Z"),
        user: {
          username: "adminuser", // ✅ 추가
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

      expect(noticeService.updateNotice).toHaveBeenCalledWith(
        "notice-uuid",
        { title: "updated", startDate: "2025-07-15", endDate: "2025-07-20" },
        true // isEvent
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.any(ResponseNoticeDTO));
    });
  });

  describe("removeNotice", () => {
    it("should remove notice if admin", async () => {
      (struct.create as jest.Mock).mockReturnValue({ noticeId: "notice-uuid" });

      const req: any = { params: {}, ...mockUser(USER_ROLE.ADMIN) };
      const res = mockResponse();

      await removeNotice(req, res);

      expect(noticeService.removeNotice).toHaveBeenCalledWith("notice-uuid");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.any(removeSuccessMessage));
    });
  });
});
