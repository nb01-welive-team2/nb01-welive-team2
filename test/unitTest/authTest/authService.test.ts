import * as authService from "../../../src/services/authService";
import * as userRepository from "../../../src/repositories/userRepository";
import * as tokenUtils from "../../../src/lib/utils/token";
import bcrypt from "bcrypt";
import { LoginRequestDTO } from "../../../src/structs/userStruct";
import BadRequestError from "../../../src/errors/BadRequestError";

jest.mock("../../../src/repositories/userRepository");
jest.mock("../../../src/lib/utils/token");
jest.mock("bcrypt");

describe("authService", () => {
  const mockUser = {
    id: "user-uuid",
    usernmae: "alice123",
    encryptedPassword:
      "$2a$10$G68FzGayQhBUnQw05b.bQuhr0tQMaACu1iXTTBCRHSxRNzGVUuRRO",
    role: "USER",
    apartmentInfo: [{ id: "apartment-id-123" }],
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
      });

      const data: LoginRequestDTO = {
        username: "alice123",
        password: "alicepassword",
      };

      const result = await authService.login(data);

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
      expect(userRepository.getUserByUsername).toHaveBeenCalledWith("alice123");
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "alicepassword",
        mockUser.encryptedPassword
      );
    });

    test("존재하지 않는 사용자일 경우 BadRequestError", async () => {
      (userRepository.getUserByUsername as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login({ username: "non-user-id", password: "password" })
      ).rejects.toThrow(BadRequestError);
    });

    test("비밀번호 불일치 시 BadRequestError", async () => {
      (userRepository.getUserByUsername as jest.Mock).mockResolvedValue(
        mockUser
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ username: "alice123", password: "wrongpassword" })
      ).rejects.toThrow(BadRequestError);
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
});
