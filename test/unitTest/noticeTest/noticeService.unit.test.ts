import noticeService from "@/services/noticeService";
import noticeRepository from "@/repositories/noticeRepository";
import userInfoRepository from "@/repositories/userInfoRepository";
import { buildSearchCondition } from "@/lib/searchCondition";
import NotFoundError from "@/errors/NotFoundError";
import ForbiddenError from "@/errors/ForbiddenError";
import { NOTICE_CATEGORY, USER_ROLE } from "@prisma/client";

jest.mock("@/repositories/noticeRepository");
jest.mock("@/repositories/userInfoRepository");
jest.mock("@/lib/searchCondition");

describe("noticeService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createNotice", () => {
    it("should call noticeRepository.create with correct params", async () => {
      const mockNotice = {
        title: "title",
        content: "content",
        isPinned: false,
        category: NOTICE_CATEGORY.MAINTENANCE,
      };
      const userId = "user-uuid";

      (noticeRepository.create as jest.Mock).mockResolvedValue(undefined);

      await noticeService.createNotice(mockNotice, userId);

      expect(noticeRepository.create).toHaveBeenCalledWith({
        user: { connect: { id: userId } },
        title: mockNotice.title,
        content: mockNotice.content,
        isPinned: mockNotice.isPinned,
        category: mockNotice.category,
      });
    });
  });

  describe("getNoticeList", () => {
    it("should build search condition, get count and list, then return them", async () => {
      const userId = "user-uuid";
      const role = USER_ROLE.ADMIN;
      const params = { page: 1, limit: 10 };

      const searchCondition = {
        whereCondition: { category: "MAINTENANCE" },
        bothCondition: {
          skip: 0,
          take: 10,
          where: { category: "MAINTENANCE" },
        },
      };

      (buildSearchCondition as jest.Mock).mockResolvedValue(searchCondition);
      (noticeRepository.getCount as jest.Mock).mockResolvedValue(42);
      (noticeRepository.getList as jest.Mock).mockResolvedValue([
        { id: "notice1", title: "Notice 1" },
        { id: "notice2", title: "Notice 2" },
      ]);

      const result = await noticeService.getNoticeList(userId, role, params);

      expect(buildSearchCondition).toHaveBeenCalledWith(params, {
        userId,
        role,
      });
      expect(noticeRepository.getCount).toHaveBeenCalledWith(
        searchCondition.whereCondition
      );
      expect(noticeRepository.getList).toHaveBeenCalledWith(
        searchCondition.bothCondition
      );

      expect(result).toEqual({
        totalCount: 42,
        notices: [
          { id: "notice1", title: "Notice 1" },
          { id: "notice2", title: "Notice 2" },
        ],
      });
    });
  });

  describe("getNotice", () => {
    const noticeId = "notice-uuid";
    const userId = "user-uuid";

    it("should throw NotFoundError if userInfo not found", async () => {
      (userInfoRepository.findByUserId as jest.Mock).mockResolvedValue(null);

      await expect(noticeService.getNotice(noticeId, userId)).rejects.toThrow(
        NotFoundError
      );
      expect(userInfoRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it("should throw NotFoundError if notice not found", async () => {
      (userInfoRepository.findByUserId as jest.Mock).mockResolvedValue({
        apartmentId: "apt-1",
      });
      (noticeRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(noticeService.getNotice(noticeId, userId)).rejects.toThrow(
        NotFoundError
      );
      expect(noticeRepository.findById).toHaveBeenCalledWith(noticeId);
    });

    it("should throw ForbiddenError if apartmentId mismatch", async () => {
      (userInfoRepository.findByUserId as jest.Mock).mockResolvedValue({
        apartmentId: "apt-1",
      });
      (noticeRepository.findById as jest.Mock).mockResolvedValue({
        user: { apartmentInfo: { id: "apt-2" } },
      });

      await expect(noticeService.getNotice(noticeId, userId)).rejects.toThrow(
        ForbiddenError
      );
    });

    it("should return notice if all checks pass", async () => {
      const mockNotice = {
        id: noticeId,
        user: { apartmentInfo: { id: "apt-1" } },
        title: "Notice title",
      };
      (userInfoRepository.findByUserId as jest.Mock).mockResolvedValue({
        apartmentId: "apt-1",
      });
      (noticeRepository.findById as jest.Mock).mockResolvedValue(mockNotice);

      const result = await noticeService.getNotice(noticeId, userId);

      expect(result).toBe(mockNotice);
    });
  });

  describe("updateNotice", () => {
    it("should call noticeRepository.update and return result", async () => {
      const noticeId = "notice-uuid";
      const body = { title: "updated title" };

      const updatedNotice = { id: noticeId, title: "updated title" };

      (noticeRepository.update as jest.Mock).mockResolvedValue(updatedNotice);

      const result = await noticeService.updateNotice(noticeId, body);

      expect(noticeRepository.update).toHaveBeenCalledWith(noticeId, body);
      expect(result).toBe(updatedNotice);
    });
  });

  describe("removeNotice", () => {
    it("should call noticeRepository.deleteById", async () => {
      const noticeId = "notice-uuid";

      (noticeRepository.deleteById as jest.Mock).mockResolvedValue(undefined);

      await noticeService.removeNotice(noticeId);

      expect(noticeRepository.deleteById).toHaveBeenCalledWith(noticeId);
    });
  });
});
