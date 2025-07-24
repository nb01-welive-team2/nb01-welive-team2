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
      const req = {
        body: {
          content: "테스트 댓글",
          postId: "d4a7c3f8-2c5b-4f9d-9d89-1fbb4e7f6321",
          boardType: "NOTICE", // ✅ 필수 값 추가
        },
        user: { userId: "user-1" },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      await createComment(req, res);

      expect(commentService.createComment).toHaveBeenCalledWith(
        {
          content: "테스트 댓글",
          postId: "d4a7c3f8-2c5b-4f9d-9d89-1fbb4e7f6321",
          boardType: "NOTICE", // ✅ 추가됨
        },
        "user-1"
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("editComment", () => {
    it("댓글 수정 성공 시 200 반환", async () => {
      (commentService.updateComment as jest.Mock).mockResolvedValue(undefined);

      const req = {
        params: { commentId: "d1f47c6b-7d8a-4c91-9a1c-5e4d3bfbac12" },
        body: {
          content: "수정된 댓글 내용",
          boardType: "NOTICE", // ✅ 이 필드 추가
        },
        user: { userId: mockUserId },
      } as any;

      const res = mockRes();

      await editComment(req, res);

      expect(commentService.updateComment).toHaveBeenCalledWith(
        "d1f47c6b-7d8a-4c91-9a1c-5e4d3bfbac12",
        req.body,
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

      const req = mockReq(
        {},
        { commentId: "a8c4e2d1-5d7f-49b6-91a4-8e73fca3c6d2" }
      );
      const res = mockRes();

      await removeComment(req, res);

      expect(commentService.removeComment).toHaveBeenCalledWith(
        "a8c4e2d1-5d7f-49b6-91a4-8e73fca3c6d2",
        mockUserId
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(new removeSuccessMessage());
    });
  });
});
