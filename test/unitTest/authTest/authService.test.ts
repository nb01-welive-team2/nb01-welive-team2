import * as authService from "@/services/authService";
import * as userRepository from "@/repositories/userRepository";
import * as tokenUtils from "@/lib/utils/token";
import * as hashUtils from "@/lib/utils/hash";
import bcrypt from "bcrypt";
import { LoginRequestDTO } from "@/structs/userStruct";
import BadRequestError from "@/errors/BadRequestError";
import UnauthError from "@/errors/UnauthError";
import { JOIN_STATUS, USER_ROLE } from "@prisma/client";

jest.mock("@/repositories/userRepository");
jest.mock("@/lib/utils/token");
jest.mock("@/lib/utils/hash");
jest.mock("bcrypt");

describe("authService", () => {
  const mockUser = {
    id: "user-uuid",
    username: "alice123",
    encryptedPassword:
      "$2a$10$G68FzGayQhBUnQw05b.bQuhr0tQMaACu1iXTTBCRHSxRNzGVUuRRO",
    role: USER_ROLE.USER,
    joinStatus: JOIN_STATUS.APPROVED,
    userInfo: { apartmentId: "apartment-id-123" },
    apartmentInfo: null,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    test("로그인 성공 시 토큰 반환", async () => {
      (userRepository.getUserByUsername as jest.Mock).mockResolvedValue(
        mockUser
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (tokenUtils.generateTokens as jest.Mock).mockReturnValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: mockUser,
      });

      const data: LoginRequestDTO = {
        username: "alice123",
        password: "alicepassword",
      };

      const result = await authService.login(data);

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: mockUser,
      });
      expect(userRepository.getUserByUsername).toHaveBeenCalledWith("alice123");
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "alicepassword",
        mockUser.encryptedPassword
      );
    });

    test("존재하지 않는 사용자일 경우 UnauthError", async () => {
      (userRepository.getUserByUsername as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login({ username: "non-user-id", password: "password" })
      ).rejects.toThrow(UnauthError);
    });

    test("비밀번호 불일치 시 UnauthError", async () => {
      (userRepository.getUserByUsername as jest.Mock).mockResolvedValue(
        mockUser
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ username: "alice123", password: "wrongpassword" })
      ).rejects.toThrow(UnauthError);
    });
  });

  describe("refreshToken", () => {
    test("유효한 리프레시 토큰일 때 새 토큰 반환", async () => {
      (tokenUtils.verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: "user-uuid",
      });
      (userRepository.getUserId as jest.Mock).mockResolvedValue(mockUser);
      (tokenUtils.generateTokens as jest.Mock).mockReturnValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });

      const result = await authService.refreshToken("refresh-token");

      expect(result).toEqual({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });
      expect(tokenUtils.verifyRefreshToken).toHaveBeenCalledWith(
        "refresh-token"
      );
      expect(userRepository.getUserId).toHaveBeenCalledWith("user-uuid");
    });

    test("토큰이 없으면 BadRequestError", async () => {
      await expect(authService.refreshToken(undefined)).rejects.toThrow(
        BadRequestError
      );
    });

    test("userId로 유저 조회 실패 시 BadRequestError", async () => {
      (tokenUtils.verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: "user-uuid",
      });
      (userRepository.getUserId as jest.Mock).mockResolvedValue(null);

      await expect(authService.refreshToken("invalid-token")).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("updatePassword", () => {
    test("비밀번호 변경 성공", async () => {
      (userRepository.getUserId as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (hashUtils.hashPassword as jest.Mock).mockResolvedValue(
        "hashed-new-password"
      );
      (userRepository.updateUser as jest.Mock).mockResolvedValue(undefined);

      await authService.updatePassword(
        "user-uuid",
        "currentPassword",
        "newPassword"
      );

      expect(userRepository.getUserId).toHaveBeenCalledWith("user-uuid");
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "currentPassword",
        mockUser.encryptedPassword
      );
      expect(hashUtils.hashPassword).toHaveBeenCalledWith("newPassword");
      expect(userRepository.updateUser).toHaveBeenCalledWith("user-uuid", {
        encryptedPassword: "hashed-new-password",
      });
    });

    test("존재하지 않는 사용자일 경우 UnauthError", async () => {
      (userRepository.getUserId as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.updatePassword(
          "invalid-id",
          "currentPassword",
          "newPassword"
        )
      ).rejects.toThrow(UnauthError);
    });

    test("현재 비밀번호 불일치 시 UnauthError", async () => {
      (userRepository.getUserId as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.updatePassword("user-uuid", "wrongPassword", "newPassword")
      ).rejects.toThrow(UnauthError);
    });
  });
});
