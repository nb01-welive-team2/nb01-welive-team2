import { Request, Response } from "express";
import * as authService from "../services/authService";
import { clearTokenCookies, setTokenCookies } from "../lib/utils/auth";
import { REFRESH_TOKEN_COOKIE_NAME } from "../lib/constance";
import { loginBodyStruct } from "../structs/userStruct";
import { create } from "superstruct";
import { AuthenticatedRequest } from "@/types/express";

export const login = async (req: Request, res: Response): Promise<void> => {
  const data = create(req.body, loginBodyStruct);
  const { accessToken, refreshToken } = await authService.login(data);
  setTokenCookies(res, accessToken, refreshToken);
  res.status(200).send();
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  clearTokenCookies(res);
  res.status(200).send();
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const getRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshToken(getRefreshToken);
  setTokenCookies(res, accessToken, newRefreshToken);

  res.status(200).send();
};

export const getMyInfo = async (req: Request, res: Response) => {
  const req2 = req as AuthenticatedRequest;
  const { userId, role, apartmentId } = req2.user;

  console.log("내 ID:", userId);
  console.log("내 역할:", role);
  console.log("내 아파트 ID:", apartmentId);

  res.status(200).json({
    userId,
    role,
    apartmentId,
  });
};
