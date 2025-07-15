import complaintService from "@/services/complaintService";
import complaintRepository from "@/repositories/complaintRepository";
import userInfoRepository from "@/repositories/userInfoRepository";
import { getUserId } from "@/repositories/userRepository";
import { USER_ROLE } from "@prisma/client";
import NotFoundError from "@/errors/NotFoundError";
import ForbiddenError from "@/errors/ForbiddenError";
import { buildSearchCondition } from "@/lib/searchCondition";

jest.mock("@/repositories/complaintRepository");
jest.mock("@/repositories/userInfoRepository");
jest.mock("@/repositories/userRepository");
jest.mock("@/lib/searchCondition");

describe("complaintService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createComplaint", () => {
    it("should call complaintRepository.create with correct params", async () => {
      const mockComplaint = { title: "t", content: "c", isPublic: true };
      const userId = "user-1";
      const apartmentId = "apt-1";

      await complaintService.createComplaint(
        mockComplaint,
        userId,
        apartmentId
      );

      expect(complaintRepository.create).toHaveBeenCalledWith({
        user: { connect: { id: userId } },
        ApartmentInfo: { connect: { id: apartmentId } },
        title: mockComplaint.title,
        content: mockComplaint.content,
        isPublic: mockComplaint.isPublic,
      });
    });
  });

  describe("getComplaintList", () => {
    it("should return complaints and totalCount with valid userInfo", async () => {
      const params = { page: 1, limit: 10 };
      const apartmentId = "apt-1";

      const mockSearchCondition = {
        whereCondition: {},
        bothCondition: {},
      };
      (buildSearchCondition as jest.Mock).mockResolvedValue(
        mockSearchCondition
      );

      (complaintRepository.getCount as jest.Mock).mockResolvedValue(5);

      const mockComplaints = [
        {
          id: "c1",
          userId: "user-1",
          user: {
            userInfo: {
              apartmentId: "apt1",
              apartmentDong: 101,
              apartmentHo: 202,
            },
          },
        },
      ];
      (complaintRepository.getList as jest.Mock).mockResolvedValue(
        mockComplaints
      );

      const result = await complaintService.getComplaintList(
        apartmentId,
        params
      );

      expect(buildSearchCondition).toHaveBeenCalledWith(
        params.page,
        params.limit,
        "",
        { apartmentId }
      );
      expect(complaintRepository.getCount).toHaveBeenCalledWith({
        where: mockSearchCondition.whereCondition,
      });
      expect(complaintRepository.getList).toHaveBeenCalledWith(
        mockSearchCondition.bothCondition
      );
      expect(result).toEqual({
        complaints: mockComplaints,
        totalCount: 5,
      });
    });

    it("should throw NotFoundError if complaint userInfo is missing", async () => {
      const params = { page: 1, limit: 10 };
      const apartmentId = "apt-1";

      (buildSearchCondition as jest.Mock).mockResolvedValue({
        whereCondition: {},
        bothCondition: {},
      });
      (complaintRepository.getCount as jest.Mock).mockResolvedValue(1);
      (complaintRepository.getList as jest.Mock).mockResolvedValue([
        { id: "c1", userId: "user-1", user: { userInfo: null } },
      ]);

      await expect(
        complaintService.getComplaintList(apartmentId, params)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getComplaint", () => {
    const complaintId = "comp-1";
    const userId = "user-1";

    describe("when role is USER", () => {
      it("should throw NotFoundError if userInfo not found", async () => {
        (userInfoRepository.findByUserId as jest.Mock).mockResolvedValue(null);

        await expect(
          complaintService.getComplaint(complaintId, userId, USER_ROLE.USER)
        ).rejects.toThrow(NotFoundError);
      });

      it("should throw NotFoundError if complaint not found", async () => {
        (userInfoRepository.findByUserId as jest.Mock).mockResolvedValue({
          apartmentId: "apt1",
        });
        (complaintRepository.findById as jest.Mock).mockResolvedValue(
          undefined
        );

        await expect(
          complaintService.getComplaint(complaintId, userId, USER_ROLE.USER)
        ).rejects.toThrow(NotFoundError);
      });

      it("should throw ForbiddenError if apartmentId mismatch", async () => {
        (userInfoRepository.findByUserId as jest.Mock).mockResolvedValue({
          apartmentId: "apt1",
        });
        (complaintRepository.findById as jest.Mock).mockResolvedValue({
          id: complaintId,
          apartmentId: "apt2",
        });

        await expect(
          complaintService.getComplaint(complaintId, userId, USER_ROLE.USER)
        ).rejects.toThrow(ForbiddenError);
      });

      it("should return complaint if all checks pass", async () => {
        const mockComplaint = { id: complaintId, apartmentId: "apt1" };
        (userInfoRepository.findByUserId as jest.Mock).mockResolvedValue({
          apartmentId: "apt1",
        });
        (complaintRepository.findById as jest.Mock).mockResolvedValue(
          mockComplaint
        );

        const result = await complaintService.getComplaint(
          complaintId,
          userId,
          USER_ROLE.USER
        );

        expect(result).toBe(mockComplaint);
      });
    });

    describe("when role is ADMIN or other", () => {
      it("should throw NotFoundError if user.apartmentInfo missing", async () => {
        (getUserId as jest.Mock).mockResolvedValue({ apartmentInfo: null });

        await expect(
          complaintService.getComplaint(complaintId, userId, USER_ROLE.ADMIN)
        ).rejects.toThrow(NotFoundError);
      });

      it("should throw NotFoundError if complaint not found", async () => {
        (getUserId as jest.Mock).mockResolvedValue({
          apartmentInfo: { id: "apt1" },
        });
        (complaintRepository.findById as jest.Mock).mockResolvedValue(
          undefined
        );

        await expect(
          complaintService.getComplaint(complaintId, userId, USER_ROLE.ADMIN)
        ).rejects.toThrow(NotFoundError);
      });

      it("should throw ForbiddenError if apartmentId mismatch", async () => {
        (getUserId as jest.Mock).mockResolvedValue({
          apartmentInfo: { id: "apt1" },
        });
        (complaintRepository.findById as jest.Mock).mockResolvedValue({
          id: complaintId,
          apartmentId: "apt2",
        });

        await expect(
          complaintService.getComplaint(complaintId, userId, USER_ROLE.ADMIN)
        ).rejects.toThrow(ForbiddenError);
      });

      it("should return complaint if all checks pass", async () => {
        const mockComplaint = { id: complaintId, apartmentId: "apt1" };
        (getUserId as jest.Mock).mockResolvedValue({
          apartmentInfo: { id: "apt1" },
        });
        (complaintRepository.findById as jest.Mock).mockResolvedValue(
          mockComplaint
        );

        const result = await complaintService.getComplaint(
          complaintId,
          userId,
          USER_ROLE.ADMIN
        );

        expect(result).toBe(mockComplaint);
      });
    });
  });

  describe("updateComplaint", () => {
    it("should call complaintRepository.update", async () => {
      const complaintId = "comp-1";
      const body = { title: "new title" };
      (complaintRepository.update as jest.Mock).mockResolvedValue(body);

      const result = await complaintService.updateComplaint(complaintId, body);

      expect(complaintRepository.update).toHaveBeenCalledWith(
        complaintId,
        body
      );
      expect(result).toBe(body);
    });
  });

  describe("removeComplaint", () => {
    it("should call complaintRepository.deleteById", async () => {
      const complaintId = "comp-1";
      (complaintRepository.deleteById as jest.Mock).mockResolvedValue({
        id: complaintId,
      });

      const result = await complaintService.removeComplaint(complaintId);

      expect(complaintRepository.deleteById).toHaveBeenCalledWith(complaintId);
      expect(result).toEqual({ id: complaintId });
    });
  });
});
