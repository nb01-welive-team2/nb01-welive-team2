import {
  login,
  logout,
  refreshToken,
  updatePassword,
} from "@/controllers/authController";
import * as authService from "@/services/authService";
import * as authUtil from "@/lib/utils/auth";
import { REFRESH_TOKEN_COOKIE_NAME } from "@/lib/constance";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "@/types/express";
import { JOIN_STATUS, USER_ROLE } from "@prisma/client";

jest.mock("@/services/authService");
jest.mock("@/lib/utils/auth");

describe("authController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: "user-id-123",
    name: "Alice",
    email: "alice@example.com",
    role: USER_ROLE.USER,
    username: "alice123",
    contact: "01012345678",
    profileImage: null,
    joinStatus: JOIN_STATUS.APPROVED,
    userInfo: {
      apartmentId: "apt-id-001",
      apartmentName: "테스트아파트",
      apartmentDong: 101,
    },
  };

  describe("login", () => {
    test("로그인 성공 시 쿠키에 토큰 설정 및 상태코드 200 반환", async () => {
      req.body = { username: "alice123", password: "alicepassword" };
      (authService.login as jest.Mock).mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: mockUser,
      });

      await login(req as Request, res as Response);

      expect(authService.login).toHaveBeenCalledWith(req.body);
      expect(authUtil.setTokenCookies).toHaveBeenCalledWith(
        res,
        "access-token",
        "refresh-token"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          username: mockUser.username,
          contact: mockUser.contact,
          avatar: "",
          joinStatus: mockUser.joinStatus,
          isActive: true,
          apartmentId: mockUser.userInfo.apartmentId,
          apartmentName: mockUser.userInfo.apartmentName,
          residentDong: mockUser.userInfo.apartmentDong,
        })
      );
    });
  });

  describe("logout", () => {
    test("로그아웃 시 쿠키의 토큰 제거 및 상태코드 200 반환", async () => {
      req.cookies = { [REFRESH_TOKEN_COOKIE_NAME]: "refresh-token" };
      req.headers = { authorization: "Bearer access-token" };
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      await logout(req as Request, res as Response);

      expect(authService.logout).toHaveBeenCalledWith("refresh-token", "access-token");
      expect(authUtil.clearTokenCookies).toHaveBeenCalledWith(res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "로그아웃이 완료되었습니다",
      });
    });
  });

  describe("refreshToken", () => {
    test("리프레시 토큰 갱신 성공 시 새 토큰 발행", async () => {
      req.cookies = { [REFRESH_TOKEN_COOKIE_NAME]: "refresh-token" };
      (authService.refreshToken as jest.Mock).mockResolvedValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });

      await refreshToken(req as Request, res as Response);

      expect(authService.refreshToken).toHaveBeenCalledWith("refresh-token");
      expect(authUtil.setTokenCookies).toHaveBeenCalledWith(
        res,
        "new-access-token",
        "new-refresh-token"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "토큰 갱신이 완료되었습니다",
      });
    });
  });

  describe("updatePassword", () => {
    test("비밀번호 변경 성공 시 상태코드 200 반환", async () => {
      const request = req as AuthenticatedRequest;
      request.body = {
        currentPassword: "currentPassword",
        newPassword: "newPassword",
      };
      request.user = {
        userId: "user-uuid",
        role: USER_ROLE.USER,
        apartmentId: "101",
      };

      (authService.updatePassword as jest.Mock).mockResolvedValue(undefined);

      await updatePassword(request as Request, res as Response);

      expect(authService.updatePassword).toHaveBeenCalledWith(
        "user-uuid",
        "currentPassword",
        "newPassword"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "비밀번호가 변경되었습니다. 다시 로그인해주세요.",
      });
    });
  });
});
