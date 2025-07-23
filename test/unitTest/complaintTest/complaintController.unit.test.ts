import {
  createComplaint,
  getComplaintList,
  getComplaint,
  editComplaint,
  removeComplaint,
  changeStatus,
} from "@/controllers/complaintController";
import complaintService from "@/services/complaintService";
import registerSuccessMessage from "@/lib/responseJson/registerSuccess";
import removeSuccessMessage from "@/lib/responseJson/removeSuccess";
import {
  ResponseComplaintListDTO,
  ResponseComplaintCommentDTO,
  ResponseComplaintDTO,
} from "@/dto/complaintDTO";
import * as struct from "superstruct";

// ✅ superstruct 부분 모킹 (create만 mock)
jest.mock("superstruct", () => {
  const actual = jest.requireActual("superstruct");
  return {
    ...actual,
    create: jest.fn(),
  };
});

jest.mock("@/services/complaintService");

describe("complaintController", () => {
  const mockUser = {
    userId: "user-1",
    apartmentId: "apt-1",
    role: "USER",
  };

  function getMockReqRes({
    body = {},
    params = {},
    query = {},
    user = mockUser,
  } = {}) {
    const req: any = {
      body,
      params,
      query,
      user,
    };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    return { req, res };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createComplaint", () => {
    it("성공적으로 complaint 생성 후 201 응답", async () => {
      const data = { title: "title", content: "content", isPublic: true };
      (struct.create as jest.Mock).mockReturnValue(data);
      (complaintService.createComplaint as jest.Mock).mockResolvedValue(
        undefined
      );

      const { req, res } = getMockReqRes({ body: data });

      await createComplaint(req, res);

      expect(struct.create).toHaveBeenCalledWith(req.body, expect.anything());
      expect(complaintService.createComplaint).toHaveBeenCalledWith(
        data,
        mockUser.userId,
        mockUser.apartmentId
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(expect.any(registerSuccessMessage));
    });
  });

  describe("getComplaintList", () => {
    it("성공적으로 complaint 리스트 반환", async () => {
      const query = { page: "1", limit: "10" };
      const data = { page: 1, limit: 10 };
      (struct.create as jest.Mock).mockReturnValue(data);

      const serviceResult = { complaints: [], totalCount: 0 };
      (complaintService.getComplaintList as jest.Mock).mockResolvedValue(
        serviceResult
      );

      const { req, res } = getMockReqRes({ query });

      await getComplaintList(req, res);

      expect(struct.create).toHaveBeenCalledWith(req.query, expect.anything());
      expect(complaintService.getComplaintList).toHaveBeenCalledWith(
        mockUser.userId,
        mockUser.role,
        mockUser.apartmentId,
        data
      );
      expect(res.send).toHaveBeenCalledWith(
        expect.any(ResponseComplaintListDTO)
      );
    });
  });

  describe("getComplaint", () => {
    it("성공적으로 complaint 반환", async () => {
      const params = { complaintId: "cid-1" };
      const complaintData = {
        id: "cid-1",
        title: "test",
        content: "test content",
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        user: { username: "mock-user" }, // ✅ 중요
        ComplaintComments: [], // ✅ 필요 시 빈 배열
      };

      (struct.create as jest.Mock).mockReturnValue(params);
      (complaintService.getComplaint as jest.Mock).mockResolvedValue(
        complaintData
      );

      const { req, res } = getMockReqRes({ params });

      await getComplaint(req, res);

      expect(struct.create).toHaveBeenCalledWith(req.params, expect.anything());
      expect(complaintService.getComplaint).toHaveBeenCalledWith(
        params.complaintId,
        mockUser.userId,
        mockUser.role
      );
      expect(res.send).toHaveBeenCalledWith(
        expect.any(ResponseComplaintCommentDTO)
      );
    });
  });

  describe("editComplaint", () => {
    it("성공적으로 complaint 수정 후 200 응답", async () => {
      const params = { complaintId: "cid-1" };
      const body = { title: "updated title" };

      const complaintUpdated = {
        id: "cid-1",
        title: "updated title",
        content: "updated content",
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        complaintStatus: "PENDING",
        _count: {
          ComplaintComments: 3,
        },
        user: {
          username: "mock-user",
          userInfo: {
            name: "mock name",
            apartmentDong: 101, // ✅ 추가
            apartmentHo: 1001, // ✅ 추가
          },
        },
      };

      (struct.create as jest.Mock).mockImplementation((input) => {
        if ("title" in input) return body; // body
        if ("complaintId" in input) return params; // params
      });

      (complaintService.updateComplaint as jest.Mock).mockResolvedValue(
        complaintUpdated
      );

      const { req, res } = getMockReqRes({ params, body });

      await editComplaint(req, res);

      expect(struct.create).toHaveBeenCalledWith(req.body, expect.anything());
      expect(struct.create).toHaveBeenCalledWith(req.params, expect.anything());
      expect(complaintService.updateComplaint).toHaveBeenCalledWith(
        params.complaintId,
        body
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.any(ResponseComplaintDTO));
    });
  });

  describe("removeComplaint", () => {
    it("성공적으로 complaint 삭제 후 200 응답", async () => {
      const params = { complaintId: "cid-1" };
      (struct.create as jest.Mock).mockReturnValue(params);
      (complaintService.removeComplaint as jest.Mock).mockResolvedValue(
        undefined
      );

      const { req, res } = getMockReqRes({ params });

      await removeComplaint(req, res);

      expect(struct.create).toHaveBeenCalledWith(req.params, expect.anything());
      expect(complaintService.removeComplaint).toHaveBeenCalledWith(
        params.complaintId
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.any(removeSuccessMessage));
    });
  });

  describe("changeStatus", () => {
    it("성공적으로 상태 변경 후 200 응답", async () => {
      const params = { complaintId: "cid-1" };
      const body = { status: "RESOLVED" };
      const complaintUpdated = {
        id: "cid-1",
        complaintStatus: "RESOLVED",
        title: "test complaint",
        content: "test content",
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        user: { username: "mock-user" },
      };

      // ✅ req.body vs req.params 구분
      (struct.create as jest.Mock).mockImplementation((input) => {
        if ("status" in input) return body; // body 요청
        if ("complaintId" in input) return params; // params 요청
      });

      (complaintService.changeStatus as jest.Mock).mockResolvedValue(
        complaintUpdated
      );

      const { req, res } = getMockReqRes({ params, body });

      await changeStatus(req, res);

      expect(struct.create).toHaveBeenCalledWith(req.body, expect.anything());
      expect(struct.create).toHaveBeenCalledWith(req.params, expect.anything());
      expect(complaintService.changeStatus).toHaveBeenCalledWith(
        params.complaintId,
        { complaintStatus: body.status }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: "상태 변경 성공" })
      );
    });
  });
});
