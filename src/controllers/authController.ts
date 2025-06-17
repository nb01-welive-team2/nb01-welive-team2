import { Request, Response } from "express";
import * as authService from "../services/authService";
import { clearTokenCookies, setTokenCookies } from "../lib/utils/auth";

export const login = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  const { accessToken, refreshToken } = await authService.login(data);
  setTokenCookies(res, accessToken, refreshToken);
  res.status(200).send();
};

export async function logout(req: Request, res: Response) {
  clearTokenCookies(res);
  res.status(200).send();
}
