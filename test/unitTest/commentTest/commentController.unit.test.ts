import {
  createComment,
  editComment,
  removeComment,
} from "@/controllers/commentController";
import commentService from "@/services/commentService";
import registerSuccessMessage from "@/lib/responseJson/registerSuccess";
import removeSuccessMessage from "@/lib/responseJson/removeSuccess";

jest.mock("@/services/commentService");

describe("Comment Controller", () => {
  const mockUserId = "user-123";

  const mockReq = (body = {}, params = {}) =>
    ({
      body,
      params,
      user: { userId: mockUserId }, // AuthenticatedRequest
    }) as any;

  const mockRes = () =>
    ({
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }) as any;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createComment", () => {
    it("댓글 생성 성공 시 201 반환", async () => {
      (commentService.createComment as jest.Mock).mockResolvedValue(undefined);

      const req = mockReq({ content: "새로운 댓글입니다." });
      const res = mockRes();

      await createComment(req, res);

      expect(commentService.createComment).toHaveBeenCalledWith(
        expect.objectContaining({ content: "새로운 댓글입니다." }),
        mockUserId
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(new registerSuccessMessage());
    });
  });

  describe("editComment", () => {
    it("댓글 수정 성공 시 200 반환", async () => {
      (commentService.updateComment as jest.Mock).mockResolvedValue(undefined);

      const req = mockReq(
        { content: "수정된 댓글" },
        { commentId: "comment-123" }
      );
      const res = mockRes();

      await editComment(req, res);

      expect(commentService.updateComment).toHaveBeenCalledWith(
        "comment-123",
        expect.objectContaining({ content: "수정된 댓글" }),
        mockUserId
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        "공지사항 정보가 성공적으로 수정되었습니다."
      );
    });
  });

  describe("removeComment", () => {
    it("댓글 삭제 성공 시 200 반환", async () => {
      (commentService.removeComment as jest.Mock).mockResolvedValue(undefined);

      const req = mockReq({}, { commentId: "comment-456" });
      const res = mockRes();

      await removeComment(req, res);

      expect(commentService.removeComment).toHaveBeenCalledWith(
        "comment-456",
        mockUserId
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(new removeSuccessMessage());
    });
  });
});
