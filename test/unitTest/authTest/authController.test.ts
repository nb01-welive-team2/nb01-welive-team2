import {
  login,
  logout,
  refreshToken,
  updatePassword,
} from "@/controllers/authController";
import * as authService from "@/services/authService";
import * as authUtil from "@/lib/utils/auth";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/constance";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "@/types/express";
import { USER_ROLE } from "@prisma/client";

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

  describe("login", () => {
    test("로그인 성공 시 쿠키에 토큰 설정 및 상태코드 200 반환", async () => {
      req.body = { username: "alice123", password: "alicepassword" };
      (authService.login as jest.Mock).mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });

      await login(req as Request, res as Response);

      expect(authService.login).toHaveBeenCalledWith(req.body);
      expect(authUtil.setTokenCookies).toHaveBeenCalledWith(
        res,
        "access-token",
        "refresh-token"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "로그인이 완료되었습니다",
      });
    });
  });

  describe("logout", () => {
    test("로그아웃 시 쿠키의 토큰 제거 및 상태코드 200 반환", async () => {
      await logout(req as Request, res as Response);

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
      expect(res.json).toHaveBeenCalledWith({ message: "비밀번호 변경 완료" });
    });
  });
});
