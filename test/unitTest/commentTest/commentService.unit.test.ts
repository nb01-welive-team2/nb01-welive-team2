import commentService from "@/services/commentService";
import commentRepository from "@/repositories/commentRepository";
import NotFoundError from "@/errors/NotFoundError";
import ForbiddenError from "@/errors/ForbiddenError";
import CommonError from "@/errors/CommonError";

jest.mock("@/repositories/commentRepository");

describe("Comment Service", () => {
  const mockUserId = "user-123";
  const mockCommentId = "comment-456";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createComment", () => {
    it("민원 게시판 댓글 생성 성공", async () => {
      await commentService.createComment(
        { boardType: "COMPLAINT", postId: "post-1", content: "새 댓글" },
        mockUserId
      );

      expect(commentRepository.createComplaintComment).toHaveBeenCalledWith({
        content: "새 댓글",
        complaint: { connect: { id: "post-1" } },
        user: { connect: { id: mockUserId } },
      });
    });

    it("공지 게시판 댓글 생성 성공", async () => {
      await commentService.createComment(
        { boardType: "NOTICE", postId: "post-2", content: "공지 댓글" },
        mockUserId
      );

      expect(commentRepository.createNoticeComment).toHaveBeenCalledWith({
        content: "공지 댓글",
        notice: { connect: { id: "post-2" } },
        user: { connect: { id: mockUserId } },
      });
    });

    it("잘못된 boardType이면 CommonError 발생", async () => {
      await expect(
        commentService.createComment(
          {
            boardType: "INVALID",
            postId: "post-3",
            content: "잘못된 댓글",
          } as any,
          mockUserId
        )
      ).rejects.toThrow(CommonError);
    });
  });

  describe("updateComment", () => {
    it("민원 댓글 수정 성공", async () => {
      (
        commentRepository.getComplaintCommentById as jest.Mock
      ).mockResolvedValue({
        id: mockCommentId,
        userId: mockUserId,
      });

      await commentService.updateComment(
        mockCommentId,
        { boardType: "COMPLAINT", boardId: "post-1", content: "수정된 댓글" },
        mockUserId
      );

      expect(commentRepository.updateComplaintComment).toHaveBeenCalledWith(
        mockCommentId,
        { content: "수정된 댓글" }
      );
    });

    it("공지 댓글 수정 성공", async () => {
      (commentRepository.getNoticeCommentById as jest.Mock).mockResolvedValue({
        id: mockCommentId,
        userId: mockUserId,
      });

      await commentService.updateComment(
        mockCommentId,
        { boardType: "NOTICE", boardId: "post-2", content: "수정된 공지 댓글" },
        mockUserId
      );

      expect(commentRepository.updateNoticeComment).toHaveBeenCalledWith(
        mockCommentId,
        { content: "수정된 공지 댓글" }
      );
    });

    it("댓글이 없으면 NotFoundError 발생", async () => {
      (
        commentRepository.getComplaintCommentById as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        commentService.updateComment(
          mockCommentId,
          { boardType: "COMPLAINT", boardId: "post-1", content: "수정" },
          mockUserId
        )
      ).rejects.toThrow(NotFoundError);
    });

    it("다른 유저가 수정하려 하면 ForbiddenError 발생", async () => {
      (
        commentRepository.getComplaintCommentById as jest.Mock
      ).mockResolvedValue({
        id: mockCommentId,
        userId: "other-user",
      });

      await expect(
        commentService.updateComment(
          mockCommentId,
          { boardType: "COMPLAINT", boardId: "post-1", content: "수정" },
          mockUserId
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it("잘못된 boardType이면 CommonError 발생", async () => {
      await expect(
        commentService.updateComment(
          mockCommentId,
          {
            boardType: "INVALID",
            postId: "post-3",
            content: "잘못된 댓글",
          } as any,
          mockUserId
        )
      ).rejects.toThrow(CommonError);
    });
  });

  describe("removeComment", () => {
    it("공지 댓글 삭제 성공", async () => {
      (commentRepository.getNoticeCommentById as jest.Mock).mockResolvedValue({
        id: mockCommentId,
        userId: mockUserId,
      });
      (
        commentRepository.getComplaintCommentById as jest.Mock
      ).mockResolvedValue(null);

      await commentService.removeComment(mockCommentId, mockUserId);

      expect(commentRepository.deleteNoticeComment).toHaveBeenCalledWith(
        mockCommentId
      );
    });

    it("민원 댓글 삭제 성공", async () => {
      (commentRepository.getNoticeCommentById as jest.Mock).mockResolvedValue(
        null
      );
      (
        commentRepository.getComplaintCommentById as jest.Mock
      ).mockResolvedValue({
        id: mockCommentId,
        userId: mockUserId,
      });

      await commentService.removeComment(mockCommentId, mockUserId);

      expect(commentRepository.deleteComplaintComment).toHaveBeenCalledWith(
        mockCommentId
      );
    });

    it("댓글이 없으면 NotFoundError 발생", async () => {
      (commentRepository.getNoticeCommentById as jest.Mock).mockResolvedValue(
        null
      );
      (
        commentRepository.getComplaintCommentById as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        commentService.removeComment(mockCommentId, mockUserId)
      ).rejects.toThrow(NotFoundError);
    });

    it("다른 유저가 삭제하려 하면 ForbiddenError 발생", async () => {
      (commentRepository.getNoticeCommentById as jest.Mock).mockResolvedValue({
        id: mockCommentId,
        userId: "other-user",
      });
      (
        commentRepository.getComplaintCommentById as jest.Mock
      ).mockResolvedValue(null);

      await expect(
        commentService.removeComment(mockCommentId, mockUserId)
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
