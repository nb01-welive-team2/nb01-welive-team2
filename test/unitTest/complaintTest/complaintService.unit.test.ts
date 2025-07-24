import complaintService from "@/services/complaintService";
import complaintRepository from "@/repositories/complaintRepository";
import apartmentInfoRepository from "@/repositories/apartmentInfoRepository";
import userInfoRepository from "@/repositories/userInfoRepository";
import { getUserId } from "@/repositories/userRepository";
import {
  notifyAdminsOfNewComplaint,
  notifyResidentOfComplaintStatusChange,
} from "@/services/notificationService";
import NotFoundError from "@/errors/NotFoundError";
import ForbiddenError from "@/errors/ForbiddenError";
import CommonError from "@/errors/CommonError";
import { COMPLAINT_STATUS, USER_ROLE } from "@prisma/client";

jest.mock("@/repositories/complaintRepository");
jest.mock("@/repositories/apartmentInfoRepository");
jest.mock("@/repositories/userInfoRepository");
jest.mock("@/repositories/userRepository");
jest.mock("@/services/notificationService");

describe("complaintService", () => {
  const mockUserId = "user-1";
  const mockApartmentId = "apt-1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createComplaint", () => {
    it("관리자 없으면 NotFoundError throw", async () => {
      (apartmentInfoRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        complaintService.createComplaint(
          { title: "t", content: "c", isPublic: true },
          mockUserId,
          mockApartmentId
        )
      ).rejects.toThrow(NotFoundError);
    });

    it("성공적으로 complaint 생성 후 notify 호출", async () => {
      const adminId = "admin-1";
      const createdComplaint = { id: "complaint-1" };
      (apartmentInfoRepository.findById as jest.Mock).mockResolvedValue({
        userId: adminId,
      });
      (complaintRepository.create as jest.Mock).mockResolvedValue(
        createdComplaint
      );
      (notifyAdminsOfNewComplaint as jest.Mock).mockResolvedValue(undefined);

      await complaintService.createComplaint(
        { title: "t", content: "c", isPublic: true },
        mockUserId,
        mockApartmentId
      );

      expect(apartmentInfoRepository.findById).toHaveBeenCalledWith(
        mockApartmentId
      );
      expect(complaintRepository.create).toHaveBeenCalledWith({
        user: { connect: { id: mockUserId } },
        ApartmentInfo: { connect: { id: mockApartmentId } },
        title: "t",
        content: "c",
        isPublic: true,
      });
      expect(notifyAdminsOfNewComplaint).toHaveBeenCalledWith(
        adminId,
        createdComplaint.id
      );
    });
  });

  describe("getComplaintList", () => {
    it("USER 역할일 때 추가 조건과 함께 목록 조회", async () => {
      const params = { page: 1, limit: 10 };
      (complaintRepository.getCount as jest.Mock).mockResolvedValue(5);
      (complaintRepository.getList as jest.Mock).mockResolvedValue([
        {
          user: { userInfo: {} },
          userId: "user1",
        },
      ]);
      (complaintService as any).buildSearchCondition = jest
        .fn()
        .mockResolvedValue({
          whereCondition: { apartmentId: mockApartmentId },
          bothCondition: {},
        });

      const result = await complaintService.getComplaintList(
        mockUserId,
        USER_ROLE.USER,
        mockApartmentId,
        params
      );

      expect(result.totalCount).toBe(5);
      expect(Array.isArray(result.complaints)).toBe(true);
    });

    it("userInfo가 없으면 NotFoundError throw", async () => {
      (complaintRepository.getCount as jest.Mock).mockResolvedValue(1);
      (complaintRepository.getList as jest.Mock).mockResolvedValue([
        { user: { userInfo: null }, userId: "user1" },
      ]);
      await expect(
        complaintService.getComplaintList(
          mockUserId,
          USER_ROLE.USER,
          mockApartmentId,
          { page: 1, limit: 10 }
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getComplaint", () => {
    it("USER 역할이면서 userInfo 없으면 NotFoundError", async () => {
      (userInfoRepository.findByUserId as jest.Mock).mockResolvedValue(null);
      await expect(
        complaintService.getComplaint("cid1", mockUserId, USER_ROLE.USER)
      ).rejects.toThrow(NotFoundError);
    });

    it("관리자 역할인데 apartmentInfo 없으면 NotFoundError", async () => {
      (getUserId as jest.Mock).mockResolvedValue({ apartmentInfo: null });
      await expect(
        complaintService.getComplaint("cid1", mockUserId, USER_ROLE.ADMIN)
      ).rejects.toThrow(NotFoundError);
    });

    it("complaint 없으면 NotFoundError", async () => {
      (userInfoRepository.findByUserId as jest.Mock).mockResolvedValue({
        apartmentId: mockApartmentId,
      });
      (complaintRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        complaintService.getComplaint("cid1", mockUserId, USER_ROLE.USER)
      ).rejects.toThrow(NotFoundError);
    });

    it("아파트 아이디가 다르면 ForbiddenError", async () => {
      (userInfoRepository.findByUserId as jest.Mock).mockResolvedValue({
        apartmentId: "otherApt",
      });
      (complaintRepository.findById as jest.Mock).mockResolvedValue({
        apartmentId: mockApartmentId,
        isSecret: false,
        userId: mockUserId,
      });

      await expect(
        complaintService.getComplaint("cid1", mockUserId, USER_ROLE.USER)
      ).rejects.toThrow(ForbiddenError);
    });

    it("비밀글인데 다른 유저가 조회하면 ForbiddenError", async () => {
      (userInfoRepository.findByUserId as jest.Mock).mockResolvedValue({
        apartmentId: mockApartmentId,
      });
      (complaintRepository.findById as jest.Mock).mockResolvedValue({
        apartmentId: mockApartmentId,
        isSecret: true,
        userId: "otherUser",
      });

      await expect(
        complaintService.getComplaint("cid1", mockUserId, USER_ROLE.USER)
      ).rejects.toThrow(ForbiddenError);
    });

    it("성공적으로 complaint 반환", async () => {
      (userInfoRepository.findByUserId as jest.Mock).mockResolvedValue({
        apartmentId: mockApartmentId,
      });
      (complaintRepository.findById as jest.Mock).mockResolvedValue({
        apartmentId: mockApartmentId,
        isSecret: false,
        userId: mockUserId,
      });

      const complaint = await complaintService.getComplaint(
        "cid1",
        mockUserId,
        USER_ROLE.USER
      );
      expect(complaint).toBeDefined();
    });
  });

  describe("updateComplaint", () => {
    it("상태가 PENDING이 아니면 CommonError throw", async () => {
      (complaintRepository.findById as jest.Mock).mockResolvedValue({
        complaintStatus: COMPLAINT_STATUS.RESOLVED,
      });
      await expect(
        complaintService.updateComplaint("cid1", {})
      ).rejects.toThrow(CommonError);
    });

    it("PENDING 상태일 때 업데이트 수행", async () => {
      const updateBody = { title: "updated" };
      (complaintRepository.findById as jest.Mock).mockResolvedValue({
        complaintStatus: COMPLAINT_STATUS.PENDING,
      });
      (complaintRepository.update as jest.Mock).mockResolvedValue(updateBody);

      const result = await complaintService.updateComplaint("cid1", updateBody);
      expect(result).toEqual(updateBody);
    });
  });

  describe("changeStatus", () => {
    it("업데이트 실패 시 NotFoundError throw", async () => {
      (complaintRepository.update as jest.Mock).mockResolvedValue(null);
      await expect(
        complaintService.changeStatus("cid1", {
          complaintStatus: COMPLAINT_STATUS.RESOLVED,
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("성공적으로 상태 변경 및 알림 호출", async () => {
      const complaint = {
        userId: mockUserId,
        id: "cid1",
        complaintStatus: COMPLAINT_STATUS.PENDING,
      };
      (complaintRepository.update as jest.Mock).mockResolvedValue(complaint);
      (notifyResidentOfComplaintStatusChange as jest.Mock).mockResolvedValue(
        undefined
      );

      const result = await complaintService.changeStatus("cid1", {
        complaintStatus: COMPLAINT_STATUS.RESOLVED,
      });

      expect(notifyResidentOfComplaintStatusChange).toHaveBeenCalledWith(
        mockUserId,
        "cid1"
      );
      expect(result).toEqual(complaint);
    });
  });

  describe("removeComplaint", () => {
    it("상태가 PENDING이 아니면 CommonError throw", async () => {
      (complaintRepository.findById as jest.Mock).mockResolvedValue({
        complaintStatus: COMPLAINT_STATUS.RESOLVED,
      });
      await expect(complaintService.removeComplaint("cid1")).rejects.toThrow(
        CommonError
      );
    });

    it("PENDING 상태일 때 삭제 성공", async () => {
      (complaintRepository.findById as jest.Mock).mockResolvedValue({
        complaintStatus: COMPLAINT_STATUS.PENDING,
      });
      (complaintRepository.deleteById as jest.Mock).mockResolvedValue(true);

      const result = await complaintService.removeComplaint("cid1");
      expect(result).toBe(true);
    });
  });
});
