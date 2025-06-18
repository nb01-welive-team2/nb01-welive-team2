import {
  login,
  logout,
  refreshToken,
} from "../../../src/controllers/authController";
import * as authService from "../../../src/services/authService";
import * as authUtil from "../../../src/lib/utils/auth";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../../../src/lib/constance";
import { Request, Response } from "express";

jest.mock("../../../src/services/authService");
jest.mock("../../../src/lib/utils/auth");

describe("authContoroller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    test("로그인 성곡 시 쿠키에 토큰 설정 및 상태코드 200 반환", async () => {
      req.body = { username: "alice123", password: "alicepassword" };
      (authService.login as jest.Mock).mockResolvedValue({
        accessToken: ACCESS_TOKEN_COOKIE_NAME,
        refreshToken: REFRESH_TOKEN_COOKIE_NAME,
      });

      await login(req as Request, res as Response);

      expect(authService.login).toHaveBeenCalledWith(req.body);
      expect(authUtil.setTokenCookies).toHaveBeenCalledWith(
        res,
        ACCESS_TOKEN_COOKIE_NAME,
        REFRESH_TOKEN_COOKIE_NAME
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    test("로그아웃 시 쿠키의 토큰 제거 및 상태코드 200 반환", async () => {
      await logout(req as Request, res as Response);

      expect(authUtil.clearTokenCookies).toHaveBeenCalledWith(res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalled();
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
      expect(res.send).toHaveBeenCalled();
    });
  });
});
