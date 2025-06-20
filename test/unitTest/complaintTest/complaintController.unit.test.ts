import {
  createComplaint,
  getComplaintList,
  getComplaint,
  editComplaint,
  removeComplaint,
} from "@/controllers/complaintController";
import complaintService from "@/services/complaintService";
import { USER_ROLE } from "@prisma/client";
import ForbiddenError from "@/errors/ForbiddenError";
import * as struct from "superstruct";
import registerSuccessMessage from "@/lib/responseJson/registerSuccess";
import removeSuccessMessage from "@/lib/responseJson/removeSuccess";
import {
  ResponseComplaintCommentDTO,
  ResponseComplaintDTO,
  ResponseComplaintListDTO,
} from "@/dto/complaintDTO";

jest.mock("@/services/complaintService");
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
  userId = "user-1",
  apartmentId = "apt-1"
) => ({
  user: {
    role,
    userId,
    apartmentId,
  },
});

describe("Complaint Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createComplaint", () => {
    it("should create complaint if user is USER", async () => {
      (struct.create as jest.Mock).mockReturnValue({
        title: "title",
        content: "content",
        isPublic: true,
      });

      const req: any = { body: {}, ...mockUser(USER_ROLE.USER) };
      const res = mockResponse();

      await createComplaint(req, res);

      expect(complaintService.createComplaint).toHaveBeenCalledWith(
        { title: "title", content: "content", isPublic: true },
        "user-1",
        "apt-1"
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(expect.any(registerSuccessMessage));
    });

    it("should throw ForbiddenError if user is not USER", async () => {
      const req: any = { body: {}, ...mockUser(USER_ROLE.ADMIN) };
      await expect(createComplaint(req, mockResponse())).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe("getComplaintList", () => {
    it("should return complaint list if not SUPER_ADMIN", async () => {
      (struct.create as jest.Mock).mockReturnValue({ page: 1, limit: 10 });
      (complaintService.getComplaintList as jest.Mock).mockResolvedValue({
        complaints: [],
        totalCount: 0,
      });

      const req: any = { query: {}, ...mockUser(USER_ROLE.USER) };
      const res = mockResponse();

      await getComplaintList(req, res);

      expect(complaintService.getComplaintList).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(
        expect.any(ResponseComplaintListDTO)
      );
    });

    it("should throw ForbiddenError if SUPER_ADMIN", async () => {
      const req: any = { query: {}, ...mockUser(USER_ROLE.SUPER_ADMIN) };
      await expect(getComplaintList(req, mockResponse())).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe("getComplaint", () => {
    it("should return single complaint if not SUPER_ADMIN", async () => {
      (struct.create as jest.Mock).mockReturnValue({
        complaintId: "complaint-1",
      });
      (complaintService.getComplaint as jest.Mock).mockResolvedValue({
        id: "complaint-1",
        title: "title",
        content: "content",
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          username: "홍길동",
          userInfo: {
            apartmentDong: 101,
            apartmentHo: 202,
          },
        },
        _count: {
          ComplaintComments: 0,
        },
        ComplaintComments: [],
      });

      const req: any = { params: {}, ...mockUser(USER_ROLE.USER) };
      const res = mockResponse();

      await getComplaint(req, res);

      expect(complaintService.getComplaint).toHaveBeenCalledWith(
        "complaint-1",
        "user-1",
        USER_ROLE.USER
      );
      expect(res.send).toHaveBeenCalledWith(
        expect.any(ResponseComplaintCommentDTO)
      );
    });

    it("should throw ForbiddenError if SUPER_ADMIN", async () => {
      const req: any = { params: {}, ...mockUser(USER_ROLE.SUPER_ADMIN) };
      await expect(getComplaint(req, mockResponse())).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe("editComplaint", () => {
    it("should edit complaint if user is USER", async () => {
      (struct.create as jest.Mock)
        .mockImplementationOnce(() => ({ title: "updated" })) // body
        .mockImplementationOnce(() => ({ complaintId: "c1" })); // params

      (complaintService.updateComplaint as jest.Mock).mockResolvedValue({
        id: "complaint-1",
        title: "Updated title",
        content: "Updated content",
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        approvalStatus: "PENDING",
        viewCount: 0,
        userId: "user-id",
        user: {
          username: "홍길동",
          userInfo: {
            apartmentDong: 101,
            apartmentHo: 202,
          },
        },
        _count: {
          ComplaintComments: 0,
        },
        ComplaintComments: [],
      });

      const req: any = { body: {}, params: {}, ...mockUser(USER_ROLE.USER) };
      const res = mockResponse();

      await editComplaint(req, res);

      expect(complaintService.updateComplaint).toHaveBeenCalledWith("c1", {
        title: "updated",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.any(ResponseComplaintDTO));
    });

    it("should throw ForbiddenError if not USER", async () => {
      const req: any = { body: {}, params: {}, ...mockUser(USER_ROLE.ADMIN) };
      await expect(editComplaint(req, mockResponse())).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe("removeComplaint", () => {
    it("should remove complaint if user is ADMIN", async () => {
      (struct.create as jest.Mock).mockReturnValue({ complaintId: "c9" });

      const req: any = { params: {}, ...mockUser(USER_ROLE.ADMIN) };
      const res = mockResponse();

      await removeComplaint(req, res);

      expect(complaintService.removeComplaint).toHaveBeenCalledWith("c9");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.any(removeSuccessMessage));
    });

    it("should throw ForbiddenError if not ADMIN", async () => {
      const req: any = { params: {}, ...mockUser(USER_ROLE.USER) };
      await expect(removeComplaint(req, mockResponse())).rejects.toThrow(
        ForbiddenError
      );
    });
  });
});
