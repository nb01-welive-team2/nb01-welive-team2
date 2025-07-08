import { Request, Response } from "express";
import * as userController from "@/controllers/userController";
import * as userService from "@/services/userService";
import { userResponseDTO } from "@/dto/userDTO";
import { AuthenticatedRequest } from "@/types/express";
import { JOIN_STATUS, USER_ROLE } from "@prisma/client";
import BadRequestError from "@/errors/BadRequestError";
import UnauthError from "@/errors/UnauthError";

jest.mock("@/services/userService");
jest.mock("@/dto/userDTO");

describe("userController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signupUser", () => {
    test("사용자 회원가입 성공", async () => {
      const mockUser = { id: "user-uuid", username: "testuser" };
      req.body = {
        username: "testuser",
        password: "password",
        name: "KimCode",
        contact: "01012345678",
        email: "test@test.com",
        apartmentName: "무지개아파트",
        role: USER_ROLE.USER,
        apartmentDong: "10",
        apartmentHo: "10",
      };

      (userService.signupUser as jest.Mock).mockResolvedValue(mockUser);
      (userResponseDTO as jest.Mock).mockReturnValue(mockUser);

      await userController.signupUser(req as Request, res as Response);

      expect(userService.signupUser).toHaveBeenCalledWith({
        username: "testuser",
        password: "password",
        name: "KimCode",
        contact: "01012345678",
        email: "test@test.com",
        apartmentName: "무지개아파트",
        role: USER_ROLE.USER,
        apartmentDong: 10,
        apartmentHo: 10,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test("아파트가 존재하지 않을 경우 BadRequestError", async () => {
      req.body = {
        username: "testuser",
        password: "password",
        name: "KimCode",
        contact: "01012345678",
        email: "test@test.com",
        apartmentName: "존재하지 않는 아파트",
        role: USER_ROLE.USER,
        apartmentDong: "10",
        apartmentHo: "10",
      };

      (userService.signupUser as jest.Mock).mockRejectedValue(
        new BadRequestError("존재하지 않는 아파트입니다.")
      );

      await expect(
        userController.signupUser(req as Request, res as Response)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("signupAdmin", () => {
    test("관리자 회원가입 성공", async () => {
      const mockAdmin = { id: "admin-uuid", username: "testadmin" };
      req.body = {
        username: "testadmin",
        password: "password",
        contact: "01012347777",
        name: "KimAdmin",
        email: "testadminemail@test.com",
        role: USER_ROLE.ADMIN,
        apartmentName: "무지개아파트",
        apartmentAddress: "123 무지개아파트 St, Seoul",
        apartmentManagementNumber: "02-123-4567",
        description: "A nice apartment complex.",
        startComplexNumber: "1",
        endComplexNumber: "10",
        startDongNumber: "1",
        endDongNumber: "10",
        startFloorNumber: "1",
        endFloorNumber: "10",
        startHoNumber: "1",
        endHoNumber: "10",
      };

      (userService.signupAdmin as jest.Mock).mockResolvedValue(mockAdmin);
      (userResponseDTO as jest.Mock).mockReturnValue(mockAdmin);

      await userController.signupAdmin(req as Request, res as Response);

      expect(userService.signupAdmin).toHaveBeenCalledWith({
        username: "testadmin",
        password: "password",
        contact: "01012347777",
        name: "KimAdmin",
        email: "testadminemail@test.com",
        role: USER_ROLE.ADMIN,
        apartmentName: "무지개아파트",
        apartmentAddress: "123 무지개아파트 St, Seoul",
        apartmentManagementNumber: "02-123-4567",
        description: "A nice apartment complex.",
        startComplexNumber: 1,
        endComplexNumber: 10,
        startDongNumber: 1,
        endDongNumber: 10,
        startFloorNumber: 1,
        endFloorNumber: 10,
        startHoNumber: 1,
        endHoNumber: 10,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockAdmin);
    });
  });

  test("슈퍼 관리자 회원가입 성공", async () => {
    const mockSuperAdmin = { id: "superadmin-uuid", username: "sup" };
    req.body = {
      username: "testSuperAdmin1",
      password: "password",
      contact: "01022224444",
      email: "testsuperadminemail@test.com",
      name: "KimSuper",
      role: USER_ROLE.SUPER_ADMIN,
      joinStatus: JOIN_STATUS.APPROVED,
    };

    (userService.signupSuperAdmin as jest.Mock).mockResolvedValue(
      mockSuperAdmin
    );
    (userResponseDTO as jest.Mock).mockReturnValue(mockSuperAdmin);

    await userController.signupSuperAdmin(req as Request, res as Response);

    expect(userService.signupSuperAdmin).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockSuperAdmin);
  });

  describe("updateUser", () => {
    test("사용자 정보 수정 성공", async () => {
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.body = { profileImage: "new-image.jpg" };
      authenticatedReq.user = {
        userId: "user-uuid",
        role: USER_ROLE.USER,
        apartmentId: "apartment-id",
      };

      (userService.updateUser as jest.Mock).mockResolvedValue(undefined);

      await userController.updateUser(
        authenticatedReq as Request,
        res as Response
      );

      expect(userService.updateUser).toHaveBeenCalledWith("user-uuid", {
        profileImage: "new-image.jpg",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "유저 정보 수정 성공" });
    });

    test("현재 비밀번호 불일치 시 UnauthError", async () => {
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.body = {
        currentPassword: "correctpassword",
        newPassword: "newsecurepassword",
      };
      authenticatedReq.user = {
        userId: "user-uuid",
        role: USER_ROLE.USER,
        apartmentId: "apartment-id",
      };

      (userService.updateUser as jest.Mock).mockRejectedValue(
        new UnauthError()
      );

      await expect(
        userController.updateUser(authenticatedReq as Request, res as Response)
      ).rejects.toThrow(UnauthError);
    });
  });

  describe("deleteAdmin", () => {
    test("관리자 정보 업데이트 성공", async () => {
      req.body = {
        contact: "01094425878",
        name: "업데이트된 관리자",
        email: "new@admin.com",
        description: "설명",
        apartmentName: "업데이트 아파트",
        apartmentAddress: "서울시",
        apartmentManagementNumber: "0319213833",
        id: "admin-uuid",
      };

      const mockResult = { ...req.body };

      (userService.updateAdmin as jest.Mock).mockResolvedValue(mockResult);

      await userController.updateAdminController(
        req as Request,
        res as Response
      );

      expect(userService.updateAdmin).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    test("권한 없음 등의 에러 발생 시 UnauthError throw", async () => {
      req.body = {
        contact: "01094425878",
        name: "업데이트된 관리자",
        email: "new@admin.com",
        description: "설명",
        apartmentName: "업데이트 아파트",
        apartmentAddress: "서울시",
        apartmentManagementNumber: "0319213833",
        id: "admin-uuid",
      };

      (userService.updateAdmin as jest.Mock).mockRejectedValue(
        new UnauthError()
      );

      await expect(
        userController.updateAdminController(req as Request, res as Response)
      ).rejects.toThrow(UnauthError);
    });
  });

  describe("deleteAdmin", () => {
    test("관리자 삭제 성공", async () => {
      req.params = { id: "admin-uuid" };
      (userService.deleteAdmin as jest.Mock).mockResolvedValue(undefined);

      await userController.deleteAdmin(req as Request, res as Response);

      expect(userService.deleteAdmin).toHaveBeenCalledWith("admin-uuid");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "관리자 정보(아파트 정보 포함) 삭제가 완료되었습니다",
      });
    });

    test("삭제 대상이 존재하지 않을 경우 BadRequestError", async () => {
      req.params = { id: "non-existent-id" };

      (userService.deleteAdmin as jest.Mock).mockRejectedValue(
        new BadRequestError("삭제할 관리자가 존재하지 않습니다.")
      );

      await expect(
        userController.deleteAdmin(req as Request, res as Response)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("approveAdmin", () => {
    test("관리자 승인 성공", async () => {
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.body = { id: "admin-uuid" };
      authenticatedReq.user = {
        userId: "super-admin-uuid",
        role: USER_ROLE.SUPER_ADMIN,
        apartmentId: "apartment-id",
      };

      (userService.approveAdmin as jest.Mock).mockResolvedValue(undefined);

      await userController.approveAdmin(
        authenticatedReq as Request,
        res as Response
      );

      expect(userService.approveAdmin).toHaveBeenCalledWith(
        "admin-uuid",
        "super-admin-uuid"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "관리자 가입 승인이 완료되었습니다",
      });
    });

    test("관리자 거절 성공", async () => {
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.body = { id: "admin-uuid" };
      authenticatedReq.user = {
        userId: "superadmin-uuid",
        role: USER_ROLE.SUPER_ADMIN,
        apartmentId: "apt-id",
      };

      (userService.rejectAdmin as jest.Mock).mockResolvedValue(undefined);

      await userController.rejectAdmin(
        authenticatedReq as Request,
        res as Response
      );

      expect(userService.rejectAdmin).toHaveBeenCalledWith(
        "admin-uuid",
        "superadmin-uuid"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "관리자 가입 거절이 완료되었습니다",
      });
    });

    test("전체 관리자 승인 성공", async () => {
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        userId: "superadmin-uuid",
        role: USER_ROLE.SUPER_ADMIN,
        apartmentId: "apt-id",
      };

      (userService.approveAllAdmins as jest.Mock).mockResolvedValue(undefined);

      await userController.approveAllAdmins(
        authenticatedReq as Request,
        res as Response
      );

      expect(userService.approveAllAdmins).toHaveBeenCalledWith(
        "superadmin-uuid"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "관리자 가입 전체 승인이 완료되었습니다",
      });
    });

    test("전체 관리자 거절 성공", async () => {
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        userId: "superadmin-uuid",
        role: USER_ROLE.SUPER_ADMIN,
        apartmentId: "apt-id",
      };

      (userService.rejectAllAdmins as jest.Mock).mockResolvedValue(undefined);

      await userController.rejectAllAdmins(
        authenticatedReq as Request,
        res as Response
      );

      expect(userService.rejectAllAdmins).toHaveBeenCalledWith(
        "superadmin-uuid"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "관리자 가입 전체 거절이 완료되었습니다",
      });
    });

    test("승인 대상이 관리자가 아닌 경우 UnauthError", async () => {
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.body = { id: "user-uuid" };
      authenticatedReq.user = {
        userId: "superadmin-uuid",
        role: USER_ROLE.SUPER_ADMIN,
        apartmentId: "apt-id",
      };

      (userService.approveAdmin as jest.Mock).mockRejectedValue(
        new UnauthError()
      );

      await expect(
        userController.approveAdmin(
          authenticatedReq as Request,
          res as Response
        )
      ).rejects.toThrow(UnauthError);
    });
  });

  describe("approveUser", () => {
    test("사용자 승인 성공", async () => {
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.params = { id: "user-uuid" };
      authenticatedReq.user = {
        userId: "admin-uuid",
        role: USER_ROLE.ADMIN,
        apartmentId: "apartment-id",
      };

      (userService.approveUser as jest.Mock).mockResolvedValue(undefined);

      await userController.approveUser(
        authenticatedReq as Request,
        res as Response
      );

      expect(userService.approveUser).toHaveBeenCalledWith(
        "user-uuid",
        "admin-uuid"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "사용자 가입 요청 승인 성공",
      });
    });

    test("사용자 거절 성공", async () => {
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.params = { id: "user-uuid" };
      authenticatedReq.user = {
        userId: "admin-uuid",
        role: USER_ROLE.ADMIN,
        apartmentId: "apartment-id",
      };

      (userService.rejectUser as jest.Mock).mockResolvedValue(undefined);

      await userController.rejectUser(
        authenticatedReq as Request,
        res as Response
      );

      expect(userService.rejectUser).toHaveBeenCalledWith(
        "user-uuid",
        "admin-uuid"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "사용자 가입 요청 거절 성공",
      });
    });

    test("전체 사용자 승인 성공", async () => {
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        userId: "admin-uuid",
        role: USER_ROLE.ADMIN,
        apartmentId: "apt-id",
      };

      (userService.approveAllUsers as jest.Mock).mockResolvedValue(undefined);

      await userController.approveAllUsers(
        authenticatedReq as Request,
        res as Response
      );

      expect(userService.approveAllUsers).toHaveBeenCalledWith("admin-uuid");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "사용자 가입 요청 전체 승인 성공",
      });
    });

    test("전체 사용자 거절 성공", async () => {
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        userId: "admin-uuid",
        role: USER_ROLE.ADMIN,
        apartmentId: "apt-id",
      };

      (userService.rejectAllUsers as jest.Mock).mockResolvedValue(undefined);

      await userController.rejectAllUsers(
        authenticatedReq as Request,
        res as Response
      );

      expect(userService.rejectAllUsers).toHaveBeenCalledWith("admin-uuid");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "사용자 가입 요청 전체 거절 성공",
      });
    });
  });

  describe("deleteRejectedUsers", () => {
    test("거절된 사용자 삭제 성공", async () => {
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        userId: "admin-uuid",
        role: USER_ROLE.ADMIN,
        apartmentId: "apartment-uuid",
      };

      (userService.deleteRejectedUsersByRole as jest.Mock).mockResolvedValue(
        undefined
      );

      await userController.deleteRejectedUsers(
        authenticatedReq as Request,
        res as Response
      );

      expect(userService.deleteRejectedUsersByRole).toHaveBeenCalledWith(
        USER_ROLE.ADMIN
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "관리자 정보(아파트 정보 포함) 삭제가 완료되었습니다",
      });
    });
  });
});
