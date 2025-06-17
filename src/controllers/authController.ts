import { Request, Response } from "express";
import * as authService from "../services/authService";
import { clearTokenCookies, setTokenCookies } from "../lib/utils/auth";
import { REFRESH_TOKEN_COOKIE_NAME } from "../lib/constance";

export const login = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
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
