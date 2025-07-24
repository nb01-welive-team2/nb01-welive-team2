import * as userService from "@/services/userService";
import * as userRepository from "@/repositories/userRepository";
import * as notificationService from "@/services/notificationService";
import * as hashUtils from "@/lib/utils/hash";
import bcrypt from "bcrypt";
import BadRequestError from "@/errors/BadRequestError";
import UnauthError from "@/errors/UnauthError";
import { JOIN_STATUS, USER_ROLE } from "@prisma/client";

jest.mock("@/repositories/userRepository");
jest.mock("@/lib/utils/hash");
jest.mock("bcrypt");
jest.mock("@/services/notificationService");
jest.mock("@/services/notificationService");

describe("userService", () => {
  const mockUser = {
    id: "user-uuid",
    username: "testuser",
    encryptedPassword: "hashed-password",
    role: USER_ROLE.USER,
  };

  const mockAdmin = {
    id: "admin-uuid",
    username: "testadmin",
    encryptedPassword: "hashed-password",
    role: USER_ROLE.ADMIN,
  };

  const mockSuperAdmin = {
    id: "super-admin-uuid",
    username: "superadmin",
    encryptedPassword: "hashed-password",
    role: USER_ROLE.SUPER_ADMIN,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signupUser", () => {
    test("사용자 회원가입 성공", async () => {
      const signupData = {
        username: "testuser",
        password: "password",
        name: "KimCode",
        contact: "010-1234-5678",
        email: "test@test.com",
        apartmentName: "무지개아파트",
        role: USER_ROLE.USER,
        apartmentDong: 10,
        apartmentHo: 10,
      };

      (userRepository.findApartment as jest.Mock).mockResolvedValue({
        id: "apartment-id",
      });
      (hashUtils.hashPassword as jest.Mock).mockResolvedValue(
        "hashed-password"
      );
      (userRepository.createUser as jest.Mock).mockResolvedValue(mockUser);
      (
        notificationService.notifyAdminsOfResidentSignup as jest.Mock
      ).mockResolvedValue(undefined);

      const result = await userService.signupUser(signupData);

      expect(result).toEqual(mockUser);
      expect(userRepository.createUser).toHaveBeenCalledWith({
        ...signupData,
        password: "hashed-password",
      });
    });

    describe("signupAdmin", () => {
      test("관리자 회원가입 성공", async () => {
        const signupData = {
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
        };

        (hashUtils.hashPassword as jest.Mock).mockResolvedValue(
          "hashed-password"
        );
        (userRepository.createAdmin as jest.Mock).mockResolvedValue(mockAdmin);
        (
          notificationService.notifySuperAdminsOfAdminSignup as jest.Mock
        ).mockResolvedValue(undefined);

        const result = await userService.signupAdmin(signupData);

        expect(result).toEqual(mockAdmin);
        expect(userRepository.createAdmin).toHaveBeenCalledWith({
          ...signupData,
          password: "hashed-password",
        });
      });
    });

    describe("signupSuperAdmin", () => {
      test("슈퍼 관리자 회원가입 성공", async () => {
        const signupData = {
          username: "testSuperAdmin1",
          password: "password",
          contact: "01022224444",
          email: "testsuperadminemail@test.com",
          name: "KimSuper",
          role: USER_ROLE.SUPER_ADMIN,
          joinStatus: JOIN_STATUS.APPROVED,
        };

        (hashUtils.hashPassword as jest.Mock).mockResolvedValue(
          "hashed-password"
        );
        (userRepository.createSuperAdmin as jest.Mock).mockResolvedValue(
          mockSuperAdmin
        );

        const result = await userService.signupSuperAdmin(signupData);

        expect(result).toEqual(mockSuperAdmin);
        expect(userRepository.createSuperAdmin).toHaveBeenCalledWith({
          ...signupData,
          password: "hashed-password",
        });
      });
    });

    test("존재하지 않는 아파트일 경우 BadRequestError", async () => {
      (userRepository.findApartment as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.signupUser({
          username: "testuser",
          password: "password",
          name: "KimCode",
          contact: "010-1234-5678",
          email: "test@test.com",
          apartmentName: "무지개아파트",
          role: USER_ROLE.USER,
          apartmentDong: 10,
          apartmentHo: 10,
        })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("updateAdmin", () => {
    test("관리자 정보 업데이트 성공", async () => {
      const updateData = {
        contact: "01094425878",
        name: "업데이트된 관리자",
        email: "new@admin.com",
        description: "설명",
        apartmentName: "업데이트 아파트",
        apartmentAddress: "서울시",
        apartmentManagementNumber: "0319213833",
        id: "admin-uuid",
      };

      (userRepository.findRoleById as jest.Mock).mockResolvedValue(mockAdmin);
      (userRepository.updateAdminAndApartment as jest.Mock).mockResolvedValue(
        updateData
      );

      const result = await userService.updateAdmin(updateData);
      expect(result).toEqual(updateData);
    });

    test("업데이트 대상 관리자가 존재하지 않을 경우 UnauthError 발생", async () => {
      (userRepository.findRoleById as jest.Mock).mockResolvedValue(null);

      const updateData = {
        contact: "01094425878",
        name: "업데이트된 관리자",
        email: "new@admin.com",
        description: "설명",
        apartmentName: "업데이트 아파트",
        apartmentAddress: "서울시",
        apartmentManagementNumber: "0319213833",
        id: "non-existent-admin-id",
      };

      await expect(userService.updateAdmin(updateData)).rejects.toThrow(
        UnauthError
      );
    });

    test("관리자가 아닐 경우 UnauthError", async () => {
      (userRepository.findRoleById as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        userService.updateAdmin({
          ...mockUser,
          contact: "",
          name: "",
          email: "",
          apartmentName: "",
          apartmentAddress: "",
          apartmentManagementNumber: "",
          description: "",
        })
      ).rejects.toThrow(UnauthError);
    });
  });

  describe("deleteRejectedUsersByRole", () => {
    test("SUPER_ADMIN이 ADMIN 삭제", async () => {
      (userRepository.deleteAdmins as jest.Mock).mockResolvedValue(
        mockAdmin.id
      );
      const result = await userService.deleteRejectedUsersByRole(
        USER_ROLE.SUPER_ADMIN
      );
      expect(result).toBe(mockAdmin.id);
    });

    test("삭제할 대상이 존재하지 않을 경우 UnauthError 발생", async () => {
      (userRepository.findRoleById as jest.Mock).mockResolvedValue(null);
      await expect(userService.deleteAdmin("non-existent-id")).rejects.toThrow(
        UnauthError
      );
    });

    test("권한 없을 경우 UnauthError", async () => {
      await expect(
        userService.deleteRejectedUsersByRole(USER_ROLE.USER)
      ).rejects.toThrow(UnauthError);
    });

    test("삭제 대상이 관리자가 아닐 경우", async () => {
      (userRepository.findRoleById as jest.Mock).mockResolvedValue(mockUser);

      await expect(userService.deleteAdmin(mockUser.id)).rejects.toThrow(
        UnauthError
      );
    });

    test("삭제에 실패할 경우 BadRequestError", async () => {
      (userRepository.findRoleById as jest.Mock).mockResolvedValue(mockAdmin);
      (userRepository.deleteById as jest.Mock).mockResolvedValue(false);

      await expect(userService.deleteAdmin(mockAdmin.id)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("updateUser", () => {
    test("비밀번호 변경 성공", async () => {
      (userRepository.getUserId as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (hashUtils.hashPassword as jest.Mock).mockResolvedValue(
        "new-hashed-password"
      );
      (userRepository.updateUser as jest.Mock).mockResolvedValue(mockUser);

      await userService.updateUser(mockUser.id, {
        currentPassword: "current",
        newPassword: "new",
      });

      expect(bcrypt.compare).toHaveBeenCalledWith("current", "hashed-password");
      expect(hashUtils.hashPassword).toHaveBeenCalledWith("new");
      expect(userRepository.updateUser).toHaveBeenCalledWith(mockUser.id, {
        encryptedPassword: "new-hashed-password",
      });
    });

    test("비밀번호가 일치하지 않을 경우 UnauthError", async () => {
      (userRepository.getUserId as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        userService.updateUser("user-uuid", {
          currentPassword: "wrong",
          newPassword: "new-password",
        })
      ).rejects.toThrow(UnauthError);
    });

    test("존재하지 않는 사용자일 경우 에러 발생", async () => {
      (userRepository.getUserId as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.updateUser("invalid-id", {
          currentPassword: "current",
          newPassword: "new",
        })
      ).rejects.toThrow();
    });
  });

  describe("approveAdmin", () => {
    test("슈퍼 관리자가 특정 관리자 승인 성공", async () => {
      (userRepository.getUserId as jest.Mock).mockResolvedValue(mockSuperAdmin);
      (userRepository.findRoleById as jest.Mock).mockResolvedValue(mockAdmin);
      (
        userRepository.updateJoinStatustoApproved as jest.Mock
      ).mockResolvedValue(undefined);

      await userService.approveAdmin(mockAdmin.id, mockSuperAdmin.id);

      expect(userRepository.updateJoinStatustoApproved).toHaveBeenCalledWith(
        mockAdmin.id
      );
    });

    describe("rejectAdmin", () => {
      test("슈퍼관리자가 특정 관리자를 거절", async () => {
        (userRepository.getUserId as jest.Mock).mockResolvedValue(
          mockSuperAdmin
        );
        (userRepository.findRoleById as jest.Mock).mockResolvedValue(mockAdmin);
        await userService.rejectAdmin(mockAdmin.id, mockSuperAdmin.id);
        expect(userRepository.updateJoinStatustoReject).toHaveBeenCalledWith(
          mockAdmin.id
        );
      });
    });

    test("슈퍼 관리자가 아닐 경우 UnauthError", async () => {
      (userRepository.getUserId as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        userService.approveAdmin(mockAdmin.id, mockUser.id)
      ).rejects.toThrow(UnauthError);
    });

    test("approveAllAdmins - 슈퍼관리자가 모든 관리자 승인 성공", async () => {
      (userRepository.getUserId as jest.Mock).mockResolvedValue(mockSuperAdmin);
      await userService.approveAllAdmins(mockSuperAdmin.id);
      expect(
        userRepository.updateJoinStatustoApprovedAllAdmins
      ).toHaveBeenCalled();
    });

    test("승인 대상이 관리자가 아닐 경우", async () => {
      (userRepository.getUserId as jest.Mock).mockResolvedValue(mockSuperAdmin);
      (userRepository.findRoleById as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        userService.approveAdmin(mockUser.id, mockSuperAdmin.id)
      ).rejects.toThrow(UnauthError);
    });

    test("rejectAllAdmins - 슈퍼관리자가 모든 관리자 거절 성공", async () => {
      (userRepository.getUserId as jest.Mock).mockResolvedValue(mockSuperAdmin);
      await userService.rejectAllAdmins(mockSuperAdmin.id);
      expect(
        userRepository.updateJoinStatustoRejectAllAdmins
      ).toHaveBeenCalled();
    });

    test("approveAllAdmins - 슈퍼관리자가 아닐 경우 UnauthError", async () => {
      (userRepository.getUserId as jest.Mock).mockResolvedValue(mockUser);
      await expect(userService.approveAllAdmins(mockUser.id)).rejects.toThrow(
        UnauthError
      );
    });
  });

  describe("approveUser", () => {
    test("관리자가 특정 사용자 승인 성공", async () => {
      (userRepository.getUserId as jest.Mock).mockResolvedValue(mockAdmin);
      (userRepository.findRoleById as jest.Mock).mockResolvedValue(mockUser);
      (
        userRepository.updateJoinStatustoApproved as jest.Mock
      ).mockResolvedValue(undefined);

      await userService.approveUser(mockUser.id, mockAdmin.id);

      expect(userRepository.updateJoinStatustoApproved).toHaveBeenCalledWith(
        mockUser.id
      );
    });

    test("관리자가 특정 사용자 거절", async () => {
      (userRepository.getUserId as jest.Mock).mockResolvedValue(mockAdmin);
      (userRepository.findRoleById as jest.Mock).mockResolvedValue(mockUser);
      await userService.rejectUser(mockUser.id, mockAdmin.id);
      expect(userRepository.updateJoinStatustoReject).toHaveBeenCalledWith(
        mockUser.id
      );
    });

    test("관리자가 아닐 경우 UnauthError", async () => {
      (userRepository.getUserId as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        userService.approveUser(mockUser.id, mockUser.id)
      ).rejects.toThrow(UnauthError);
    });
  });

  test("approveAllUsers - 관리자가 전체 승인", async () => {
    (userRepository.getUserId as jest.Mock).mockResolvedValue(mockAdmin);
    await userService.approveAllUsers(mockAdmin.id);
    expect(
      userRepository.updateJoinStatustoApprovedAllUsers
    ).toHaveBeenCalled();
  });

  test("rejectAllUsers - 관리자가 전체 거절", async () => {
    (userRepository.getUserId as jest.Mock).mockResolvedValue(mockAdmin);
    await userService.rejectAllUsers(mockAdmin.id);
    expect(userRepository.updateJoinStatustoRejectAllUsers).toHaveBeenCalled();
  });

  test("approveAllUsers - 관리자가 아닐 경우 UnauthError", async () => {
    (userRepository.getUserId as jest.Mock).mockResolvedValue(mockUser);
    await expect(userService.approveAllUsers(mockUser.id)).rejects.toThrow(
      UnauthError
    );
  });

  describe("deleteAdmin", () => {
    test("관리자 삭제 성공", async () => {
      (userRepository.findRoleById as jest.Mock).mockResolvedValue(mockAdmin);
      (userRepository.deleteById as jest.Mock).mockResolvedValue(true);

      await userService.deleteAdmin(mockAdmin.id);

      expect(userRepository.deleteById).toHaveBeenCalledWith(mockAdmin.id);
    });

    test("관리자가 아닐 경우 UnauthError", async () => {
      (userRepository.findRoleById as jest.Mock).mockResolvedValue(mockUser);

      await expect(userService.deleteAdmin(mockUser.id)).rejects.toThrow(
        UnauthError
      );
    });
  });
});
