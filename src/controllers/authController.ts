import { Request, Response } from "express";
import * as authService from "../services/authService";
import { clearTokenCookies, setTokenCookies } from "../lib/utils/auth";
import { REFRESH_TOKEN_COOKIE_NAME } from "../lib/constance";
import {
  loginBodyStruct,
  UpdatePasswordBodyStruct,
} from "../structs/userStruct";
import { create } from "superstruct";
import { AuthenticatedRequest } from "@/types/express";

export const login = async (req: Request, res: Response): Promise<void> => {
  const data = create(req.body, loginBodyStruct);
  const { accessToken, refreshToken } = await authService.login(data);
  setTokenCookies(res, accessToken, refreshToken);
  res.status(200).json({ message: "로그인이 완료되었습니다" });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  clearTokenCookies(res);
  res.status(200).json({ message: "로그아웃이 완료되었습니다" });
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const getRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshToken(getRefreshToken);
  setTokenCookies(res, accessToken, newRefreshToken);

  res.status(200).json({ message: "토큰 갱신이 완료되었습니다" });
};

export const updatePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { currentPassword, newPassword } = create(
    req.body,
    UpdatePasswordBodyStruct
  );
  const request = req as AuthenticatedRequest;
  const userId = request.user.userId;
  await authService.updatePassword(userId, currentPassword, newPassword);

  res.status(200).json({ message: "비밀번호 변경 완료" });
};
