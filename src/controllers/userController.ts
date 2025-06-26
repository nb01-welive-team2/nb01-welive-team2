import { Request, Response } from "express";
import * as userService from "@/services/userService";
import { userResponseDTO } from "@/dto/userDTO";
import { UserType } from "@/types/User";
import { create } from "superstruct";
import {
  signupAdminStruct,
  signupSuperAdminStruct,
  signupUserStruct,
  updateAdminStruct,
  UpdateUserBodyStruct,
} from "@/structs/userStruct";
import { AuthenticatedRequest } from "@/types/express";

export const signupUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = create(req.body, signupUserStruct);
  const fixedData = {
    ...data,
    apartmentDong: Number(data.apartmentDong),
    apartmentHo: Number(data.apartmentHo),
  };
  const user = await userService.signupUser(fixedData);

  res.status(201).json(userResponseDTO(user as UserType));
};

export const signupAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = create(req.body, signupAdminStruct);
  const fixedData = {
    ...data,
    startComplexNumber: Number(data.startComplexNumber),
    endComplexNumber: Number(data.endComplexNumber),
    startDongNumber: Number(data.startDongNumber),
    endDongNumber: Number(data.endDongNumber),
    startFloorNumber: Number(data.startFloorNumber),
    endFloorNumber: Number(data.endFloorNumber),
    startHoNumber: Number(data.startHoNumber),
    endHoNumber: Number(data.endHoNumber),
  };
  const user = await userService.signupAdmin(fixedData);

  res.status(201).json(userResponseDTO(user as UserType));
};

export const signupSuperAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = create(req.body, signupSuperAdminStruct);
  const user = await userService.signupSuperAdmin(data);

  res.status(201).json(userResponseDTO(user as UserType));
};

export const updateAdminController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = create(req.body, updateAdminStruct);
  const updated = await userService.updateAdmin(data);

  res.status(200).json(updated);
};

export const deleteAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id: userId } = req.params;
  await userService.deleteAdmin(userId);

  res.status(200).json();
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = create(req.body, UpdateUserBodyStruct);
  const request = req as AuthenticatedRequest;
  const userId = request.user.userId;
  await userService.updateUser(userId, data);

  res.status(200).json();
};

export const deleteRejectedUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const role = request.user.role;

  await userService.deleteRejectedUsersByRole(role);

  res.status(200).json();
};

export const approveAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const loginId = request.user.userId;

  const { id: bodyId } = req.body;

  await userService.approveAdmin(bodyId, loginId);
  res.status(200).json();
};

export const rejectAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const loginId = request.user.userId;

  const { id: bodyId } = req.body;

  await userService.rejectAdmin(bodyId, loginId);
  res.status(200).json();
};

export const approveUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const loginId = request.user.userId;

  const { id: bodyId } = req.params;

  await userService.approveUser(bodyId, loginId);
  res.status(200).json();
};

export const rejectUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const loginId = request.user.userId;

  const { id: bodyId } = req.params;

  await userService.rejectUser(bodyId, loginId);
  res.status(200).json();
};
