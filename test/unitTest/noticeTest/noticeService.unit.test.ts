import noticeService from "@/services/noticeService";
import noticeRepository from "@/repositories/noticeRepository";
import userInfoRepository from "@/repositories/userInfoRepository";
import { buildSearchCondition } from "@/lib/searchCondition";
import NotFoundError from "@/errors/NotFoundError";
import ForbiddenError from "@/errors/ForbiddenError";
import { NOTICE_CATEGORY, USER_ROLE } from "@prisma/client";
import * as userRepository from "@/repositories/userRepository";

jest.mock("@/repositories/noticeRepository");
jest.mock("@/repositories/userInfoRepository");
jest.mock("@/repositories/userRepository");
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
      const apartmentId = "apt-uuid";

      (noticeRepository.create as jest.Mock).mockResolvedValue(undefined);

      await noticeService.createNotice(mockNotice, userId, apartmentId);

      expect(noticeRepository.create).toHaveBeenCalledWith({
        user: { connect: { id: userId } },
        ApartmentInfo: { connect: { id: apartmentId } },
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

    describe("when role is USER", () => {
      it("should throw NotFoundError if userInfo not found", async () => {
        (userInfoRepository.findByUserId as jest.Mock).mockResolvedValue(null);

        await expect(
          noticeService.getNotice(noticeId, userId, USER_ROLE.USER)
        ).rejects.toThrow(NotFoundError);

        expect(userInfoRepository.findByUserId).toHaveBeenCalledWith(userId);
      });

      it("should throw ForbiddenError if apartmentId mismatch", async () => {
        (userInfoRepository.findByUserId as jest.Mock).mockResolvedValue({
          apartmentId: "apt-1",
        });
        (noticeRepository.findById as jest.Mock).mockResolvedValue({
          user: { apartmentInfo: { id: "apt-2" } },
        });

        await expect(
          noticeService.getNotice(noticeId, userId, USER_ROLE.USER)
        ).rejects.toThrow(ForbiddenError);
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

        const result = await noticeService.getNotice(
          noticeId,
          userId,
          USER_ROLE.USER
        );

        expect(result).toBe(mockNotice);
      });
    });

    describe("when role is ADMIN", () => {
      it("should throw NotFoundError if user.apartmentInfo not found", async () => {
        (userRepository.getUserId as jest.Mock).mockResolvedValue({
          apartmentInfo: null,
        });

        await expect(
          noticeService.getNotice(noticeId, userId, USER_ROLE.ADMIN)
        ).rejects.toThrow(NotFoundError);
      });

      it("should throw ForbiddenError if apartmentId mismatch", async () => {
        (userRepository.getUserId as jest.Mock).mockResolvedValue({
          apartmentInfo: { id: "apt-1" },
        });
        (noticeRepository.findById as jest.Mock).mockResolvedValue({
          user: { apartmentInfo: { id: "apt-2" } },
        });

        await expect(
          noticeService.getNotice(noticeId, userId, USER_ROLE.ADMIN)
        ).rejects.toThrow(ForbiddenError);
      });

      it("should return notice if all checks pass", async () => {
        const mockNotice = {
          id: noticeId,
          user: { apartmentInfo: { id: "apt-1" } },
          title: "Notice title",
        };
        (userRepository.getUserId as jest.Mock).mockResolvedValue({
          apartmentInfo: { id: "apt-1" },
        });
        (noticeRepository.findById as jest.Mock).mockResolvedValue(mockNotice);

        const result = await noticeService.getNotice(
          noticeId,
          userId,
          USER_ROLE.ADMIN
        );

        expect(result).toBe(mockNotice);
      });
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
