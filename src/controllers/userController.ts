import { Request, Response } from "express";
import * as userService from "@/services/userService";
import { userResponseDTO } from "@/dto/userDTO";
import { UserType } from "@/types/User";

export const signupUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = req.body;
  const user = await userService.signupUser(data);

  res.status(200).json(userResponseDTO(user as UserType));
};
