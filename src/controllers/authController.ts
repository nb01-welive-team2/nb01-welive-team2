import { Request, Response } from "express";
import * as authService from "../services/authService";
import { setTokenCookies } from "../lib/utils/auth";

export const login = async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  console.log("data: ", data);
  const { accessToken, refreshToken } = await authService.login(data);
  setTokenCookies(res, accessToken, refreshToken);
  res.status(200).send();
};
