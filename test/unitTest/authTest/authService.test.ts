import * as authService from "@/services/authService";
import * as userRepository from "@/repositories/userRepository";
import * as tokenUtils from "@/lib/utils/token";
import * as hashUtils from "@/lib/utils/hash";
import bcrypt from "bcrypt";
import { LoginRequestDTO } from "@/structs/userStruct";
import BadRequestError from "@/errors/BadRequestError";
import UnauthError from "@/errors/UnauthError";
import { JOIN_STATUS, USER_ROLE } from "@prisma/client";
import { redis } from "@/lib/redis";
import jwt from "jsonwebtoken";

jest.mock("@/repositories/userRepository");
jest.mock("@/lib/utils/token");
jest.mock("@/lib/utils/hash");
jest.mock("bcrypt");
jest.mock("@/lib/redis");
jest.mock("jsonwebtoken");

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

  const mockRedis = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  };

  beforeEach(() => {
    (redis.set as jest.Mock) = mockRedis.set;
    (redis.get as jest.Mock) = mockRedis.get;
    (redis.del as jest.Mock) = mockRedis.del;
    (redis.keys as jest.Mock) = mockRedis.keys;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    test("SUPER_ADMIN 로그인 성공", async () => {
      const superAdminUser = {
        ...mockUser,
        role: USER_ROLE.SUPER_ADMIN,
        apartmentInfo: null,
        userInfo: null,
      };
      
      (userRepository.getUserByUsername as jest.Mock).mockResolvedValue(
        superAdminUser
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (tokenUtils.generateTokens as jest.Mock).mockReturnValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        jti: "jti-123",
      });
      mockRedis.set.mockResolvedValue("OK");

      const data: LoginRequestDTO = {
        username: "superadmin",
        password: "superpassword",
      };

      const result = await authService.login(data);

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: superAdminUser,
      });
      expect(tokenUtils.generateTokens).toHaveBeenCalledWith(
        superAdminUser.id,
        USER_ROLE.SUPER_ADMIN,
        null
      );
    });
    
    test("승인되지 않은 사용자 로그인 시도 시 UnauthError", async () => {
      const pendingUser = {
        ...mockUser,
        joinStatus: JOIN_STATUS.PENDING,
      };
      
      (userRepository.getUserByUsername as jest.Mock).mockResolvedValue(
        pendingUser
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        authService.login({ username: "pending-user", password: "password" })
      ).rejects.toThrow(UnauthError);
    });
    
    test("유효하지 않은 사용자 역할 시 UnauthError", async () => {
      const invalidUser = {
        ...mockUser,
        role: "INVALID_ROLE",
        apartmentInfo: null,
        userInfo: null,
      };
      
      (userRepository.getUserByUsername as jest.Mock).mockResolvedValue(
        invalidUser
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        authService.login({ username: "invalid-user", password: "password" })
      ).rejects.toThrow(UnauthError);
    });
    
    test("로그인 성공 시 토큰 반환", async () => {
      (userRepository.getUserByUsername as jest.Mock).mockResolvedValue(
        mockUser
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (tokenUtils.generateTokens as jest.Mock).mockReturnValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        jti: "jti-123",
      });
      mockRedis.set.mockResolvedValue("OK");

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
      expect(tokenUtils.generateTokens).toHaveBeenCalledWith(
        "user-uuid",
        USER_ROLE.USER,
        "apartment-id-123"
      );
      expect(mockRedis.set).toHaveBeenCalledWith(
        "refresh_token:user-uuid:jti-123",
        "refresh-token",
        { ex: 604800 }
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
    test("저장된 토큰과 요청 토큰이 다를 경우 UnauthError", async () => {
      (tokenUtils.verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: "user-uuid",
        jti: "old-jti",
      });
      mockRedis.get.mockResolvedValue("different-token");
      mockRedis.keys.mockResolvedValue(["key1", "key2"]);
      mockRedis.del.mockResolvedValue(1);

      await expect(authService.refreshToken("refresh-token")).rejects.toThrow(
        UnauthError
      );
      
      expect(mockRedis.keys).toHaveBeenCalledWith("refresh_token:user-uuid:*");
      expect(mockRedis.del).toHaveBeenCalledTimes(2);
    });
    
    test("유효한 리프레시 토큰일 때 새 토큰 반환", async () => {
      (tokenUtils.verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: "user-uuid",
        jti: "old-jti",
      });
      (userRepository.getUserId as jest.Mock).mockResolvedValue({
        ...mockUser,
        apartmentId: "apartment-id-123",
      });
      (tokenUtils.generateTokens as jest.Mock).mockReturnValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        jti: "new-jti",
      });
      mockRedis.get.mockResolvedValue("refresh-token");
      mockRedis.del.mockResolvedValue(1);
      mockRedis.set.mockResolvedValue("OK");

      const result = await authService.refreshToken("refresh-token");

      expect(result).toEqual({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });
      expect(tokenUtils.verifyRefreshToken).toHaveBeenCalledWith(
        "refresh-token"
      );
      expect(userRepository.getUserId).toHaveBeenCalledWith("user-uuid");
      expect(mockRedis.get).toHaveBeenCalledWith("refresh_token:user-uuid:old-jti");
      expect(mockRedis.del).toHaveBeenCalledWith("refresh_token:user-uuid:old-jti");
      expect(mockRedis.set).toHaveBeenCalledWith(
        "refresh_token:user-uuid:new-jti",
        "new-refresh-token",
        { ex: 604800 }
      );
    });

    test("토큰이 없으면 BadRequestError", async () => {
      await expect(authService.refreshToken(undefined)).rejects.toThrow(
        BadRequestError
      );
    });

    test("userId로 유저 조회 실패 시 BadRequestError", async () => {
      (tokenUtils.verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: "user-uuid",
        jti: "jti-123",
      });
      mockRedis.get.mockResolvedValue("invalid-token");
      mockRedis.keys.mockResolvedValue(["key1", "key2"]);
      mockRedis.del.mockResolvedValue(1);
      (userRepository.getUserId as jest.Mock).mockResolvedValue(null);

      await expect(authService.refreshToken("invalid-token")).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("logout", () => {
    test("리프레시 토큰과 액세스 토큰 모두 제공된 경우", async () => {
      (tokenUtils.verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: "user-id",
        jti: "refresh-jti",
      });
      
      (jwt.decode as jest.Mock).mockReturnValue({
        jti: "access-jti",
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      });
      
      mockRedis.del.mockResolvedValue(1);
      mockRedis.set.mockResolvedValue("OK");

      await authService.logout("refresh-token", "access-token");

      expect(tokenUtils.verifyRefreshToken).toHaveBeenCalledWith("refresh-token");
      expect(jwt.decode).toHaveBeenCalledWith("access-token");
      expect(mockRedis.del).toHaveBeenCalledWith("refresh_token:user-id:refresh-jti");
      expect(mockRedis.set).toHaveBeenCalledWith(
        "blacklist:access_token:access-jti",
        true,
        expect.objectContaining({ ex: expect.any(Number) })
      );
    });

    test("토큰 검증 중 에러 발생", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      
      (tokenUtils.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error("Token verification failed");
      });

      await authService.logout("invalid-token", "invalid-access-token");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Logout failed:",
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe("deleteAllUserRefreshTokens", () => {
    test("사용자의 모든 리프레시 토큰 삭제", async () => {
      mockRedis.keys.mockResolvedValue(["key1", "key2", "key3"]);
      mockRedis.del.mockResolvedValue(1);

      await authService.deleteAllUserRefreshTokens("user-id");

      expect(mockRedis.keys).toHaveBeenCalledWith("refresh_token:user-id:*");
      expect(mockRedis.del).toHaveBeenCalledTimes(3);
    });

    test("사용자의 리프레시 토큰이 없는 경우", async () => {
      mockRedis.keys.mockResolvedValue([]);

      await authService.deleteAllUserRefreshTokens("user-id");

      expect(mockRedis.keys).toHaveBeenCalledWith("refresh_token:user-id:*");
      expect(mockRedis.del).not.toHaveBeenCalled();
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
      mockRedis.keys.mockResolvedValue([]);

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
      mockRedis.keys.mockResolvedValue([]);

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
      mockRedis.keys.mockResolvedValue([]);

      await expect(
        authService.updatePassword("user-uuid", "wrongPassword", "newPassword")
      ).rejects.toThrow(UnauthError);
    });
  });
});
