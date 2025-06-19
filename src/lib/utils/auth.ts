import { Response } from "express";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  NODE_ENV,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../constance";

export function setTokenCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: false,
    maxAge: 1 * 60 * 60 * 1000, // 1 hour
  });
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth/refresh",
  });
}

export function clearTokenCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: false,
  });
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: false,
    path: "/api/auth/refresh",
  });
}
