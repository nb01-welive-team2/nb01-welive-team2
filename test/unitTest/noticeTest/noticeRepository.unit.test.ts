// test/unitTest/noticeTest/noticeRepository.unit.test.ts
import noticeRepository from "@/repositories/noticeRepository";
import { prisma } from "@/lib/prisma";
import { NOTICE_CATEGORY } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    notices: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("noticeRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should call prisma.notices.create with correct data and return result", async () => {
      const input = {
        title: "Test Notice",
        content: "This is a test notice",
        isPinned: false,
        category: "MAINTENANCE" as const,
        user: { connect: { id: "user-uuid" } },
        ApartmentInfo: { connect: { id: "apt-uuid" } },
        event: { connect: { id: "event-uuid" } },
      };
      const expectedResult = { id: "1", ...input };

      (prisma.notices.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await noticeRepository.create(input);

      expect(prisma.notices.create).toHaveBeenCalledWith({ data: input });
      expect(result).toBe(expectedResult);
    });
  });

  describe("update", () => {
    it("should call prisma.notices.update with correct args and return result", async () => {
      const noticeId = "notice-uuid";
      const data = { title: "updated" };
      const expectedResult = {
        id: noticeId,
        title: "updated",
        user: { username: "user1" },
        _count: { NoticeComments: 3 },
      };

      (prisma.notices.update as jest.Mock).mockResolvedValue(expectedResult);

      const result = await noticeRepository.update(noticeId, data);

      expect(prisma.notices.update).toHaveBeenCalledWith({
        data,
        where: { id: noticeId },
        include: {
          user: { select: { username: true } },
          _count: { select: { NoticeComments: true } },
        },
      });
      expect(result).toBe(expectedResult);
    });
  });

  describe("findById", () => {
    it("should call prisma.notices.findUnique with correct args and return result", async () => {
      const noticeId = "notice-uuid";
      const expectedResult = {
        id: noticeId,
        user: {
          username: "user1",
          apartmentInfo: { id: "apt-1" },
        },
        NoticeComments: [
          { id: "comment-1", user: { username: "user2" }, content: "comment" },
        ],
        event: { id: "event-1", title: "Test Event" },
      };

      (prisma.notices.findUnique as jest.Mock).mockResolvedValue(
        expectedResult
      );

      const result = await noticeRepository.findById(noticeId);

      expect(prisma.notices.findUnique).toHaveBeenCalledWith({
        where: { id: noticeId },
        include: {
          user: {
            include: { apartmentInfo: { select: { id: true } } },
          },
          NoticeComments: {
            include: { user: { select: { username: true } } },
          },
          event: true,
        },
      });
      expect(result).toBe(expectedResult);
    });
  });

  describe("getList", () => {
    it("should call prisma.notices.findMany with params and include and return result", async () => {
      const params = { where: { isPinned: true } };
      const expectedResult = [
        {
          id: "notice1",
          user: { username: "user1" },
          event: { id: "event-1" },
          _count: { NoticeComments: 2 },
        },
        {
          id: "notice2",
          user: { username: "user2" },
          event: null,
          _count: { NoticeComments: 1 },
        },
      ];

      (prisma.notices.findMany as jest.Mock).mockResolvedValue(expectedResult);

      const result = await noticeRepository.getList(params);

      expect(prisma.notices.findMany).toHaveBeenCalledWith({
        ...params,
        include: {
          user: { select: { username: true } },
          event: true,
          _count: { select: { NoticeComments: true } },
        },
      });
      expect(result).toBe(expectedResult);
    });
  });

  describe("getCount", () => {
    it("should call prisma.notices.count with params and return count", async () => {
      const params = { where: { category: NOTICE_CATEGORY.MAINTENANCE } };
      const expectedCount = 5;

      (prisma.notices.count as jest.Mock).mockResolvedValue(expectedCount);

      const result = await noticeRepository.getCount(params);

      expect(prisma.notices.count).toHaveBeenCalledWith(params);
      expect(result).toBe(expectedCount);
    });
  });

  describe("deleteById", () => {
    it("should call prisma.notices.delete with correct where and return result", async () => {
      const noticeId = "notice-uuid";
      const expectedResult = { id: noticeId };

      (prisma.notices.delete as jest.Mock).mockResolvedValue(expectedResult);

      const result = await noticeRepository.deleteById(noticeId);

      expect(prisma.notices.delete).toHaveBeenCalledWith({
        where: { id: noticeId },
      });
      expect(result).toBe(expectedResult);
    });
  });
});
