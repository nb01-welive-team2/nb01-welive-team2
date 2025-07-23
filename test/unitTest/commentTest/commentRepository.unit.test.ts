import commentRepository from "@/repositories/commentRepository";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    noticeComments: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    complaintComments: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("commentRepository", () => {
  const mockNoticeCommentData = {
    content: "Notice comment",
    notice: { connect: { id: "notice-123" } },
    user: { connect: { id: "user-456" } },
  };

  const mockComplaintCommentData = {
    content: "Complaint comment",
    complaint: { connect: { id: "complaint-123" } },
    user: { connect: { id: "user-456" } },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createNoticeComment", () => {
    it("공지 댓글 생성 호출", async () => {
      (prisma.noticeComments.create as jest.Mock).mockResolvedValue(
        mockNoticeCommentData
      );

      const result = await commentRepository.createNoticeComment(
        mockNoticeCommentData
      );

      expect(prisma.noticeComments.create).toHaveBeenCalledWith({
        data: mockNoticeCommentData,
      });
      expect(result).toEqual(mockNoticeCommentData);
    });
  });

  describe("createComplaintComment", () => {
    it("민원 댓글 생성 호출", async () => {
      (prisma.complaintComments.create as jest.Mock).mockResolvedValue(
        mockComplaintCommentData
      );

      const result = await commentRepository.createComplaintComment(
        mockComplaintCommentData
      );

      expect(prisma.complaintComments.create).toHaveBeenCalledWith({
        data: mockComplaintCommentData,
      });
      expect(result).toEqual(mockComplaintCommentData);
    });
  });

  describe("updateNoticeComment", () => {
    it("공지 댓글 업데이트 호출", async () => {
      const updateData = { content: "Updated notice comment" };
      (prisma.noticeComments.update as jest.Mock).mockResolvedValue(updateData);

      const result = await commentRepository.updateNoticeComment(
        "notice-123",
        updateData
      );

      expect(prisma.noticeComments.update).toHaveBeenCalledWith({
        where: { id: "notice-123" },
        data: updateData,
      });
      expect(result).toEqual(updateData);
    });
  });

  describe("updateComplaintComment", () => {
    it("민원 댓글 업데이트 호출", async () => {
      const updateData = { content: "Updated complaint comment" };
      (prisma.complaintComments.update as jest.Mock).mockResolvedValue(
        updateData
      );

      const result = await commentRepository.updateComplaintComment(
        "complaint-123",
        updateData
      );

      expect(prisma.complaintComments.update).toHaveBeenCalledWith({
        where: { id: "complaint-123" },
        data: updateData,
      });
      expect(result).toEqual(updateData);
    });
  });

  describe("getNoticeCommentById", () => {
    it("공지 댓글 조회 호출", async () => {
      (prisma.noticeComments.findUnique as jest.Mock).mockResolvedValue(
        mockNoticeCommentData
      );

      const result = await commentRepository.getNoticeCommentById("notice-123");

      expect(prisma.noticeComments.findUnique).toHaveBeenCalledWith({
        where: { id: "notice-123" },
      });
      expect(result).toEqual(mockNoticeCommentData);
    });
  });

  describe("getComplaintCommentById", () => {
    it("민원 댓글 조회 호출", async () => {
      (prisma.complaintComments.findUnique as jest.Mock).mockResolvedValue(
        mockComplaintCommentData
      );

      const result =
        await commentRepository.getComplaintCommentById("complaint-123");

      expect(prisma.complaintComments.findUnique).toHaveBeenCalledWith({
        where: { id: "complaint-123" },
      });
      expect(result).toEqual(mockComplaintCommentData);
    });
  });

  describe("deleteNoticeComment", () => {
    it("공지 댓글 삭제 호출", async () => {
      (prisma.noticeComments.delete as jest.Mock).mockResolvedValue(
        mockNoticeCommentData
      );

      const result = await commentRepository.deleteNoticeComment("notice-123");

      expect(prisma.noticeComments.delete).toHaveBeenCalledWith({
        where: { id: "notice-123" },
      });
      expect(result).toEqual(mockNoticeCommentData);
    });
  });

  describe("deleteComplaintComment", () => {
    it("민원 댓글 삭제 호출", async () => {
      (prisma.complaintComments.delete as jest.Mock).mockResolvedValue(
        mockComplaintCommentData
      );

      const result =
        await commentRepository.deleteComplaintComment("complaint-123");

      expect(prisma.complaintComments.delete).toHaveBeenCalledWith({
        where: { id: "complaint-123" },
      });
      expect(result).toEqual(mockComplaintCommentData);
    });
  });
});
