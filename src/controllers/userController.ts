import { Request, Response } from "express";
import * as userService from "@/services/userService";
import { SignupResponseDTO, userResponseDTO } from "@/dto/userDTO";
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
import { UUID } from "@/structs/commonStructs";

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
  const newUser = new SignupResponseDTO({
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    joinStatus: user.joinStatus,
    isActive: true,
  });

  res.status(201).json(newUser);
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
  const newAdmin = new SignupResponseDTO({
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    joinStatus: user.joinStatus,
    isActive: true,
  });

  res.status(201).json(newAdmin);
};

export const signupSuperAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = create(req.body, signupSuperAdminStruct);
  const user = await userService.signupSuperAdmin(data);

  const newSuperAdmin = new SignupResponseDTO({
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    joinStatus: user.joinStatus,
    isActive: true,
  });

  res.status(201).json(newSuperAdmin);
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

  res
    .status(200)
    .json({ message: "관리자 정보(아파트 정보 포함) 삭제가 완료되었습니다" });
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = create(req.body, UpdateUserBodyStruct);
  const request = req as AuthenticatedRequest;
  const userId = request.user.userId;
  await userService.updateUser(userId, data);

  res.status(200).json({ message: "유저 정보 수정 성공" });
};

export const deleteRejectedUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const role = request.user.role;

  await userService.deleteRejectedUsersByRole(role);

  res
    .status(200)
    .json({ message: "관리자 정보(아파트 정보 포함) 삭제가 완료되었습니다" });
};

export const approveAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const loginId = request.user.userId;

  const { id: bodyId } = req.body;

  await userService.approveAdmin(bodyId, loginId);
  res.status(200).json({ message: "관리자 가입 승인이 완료되었습니다" });
};

export const rejectAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const loginId = request.user.userId;

  const { id: bodyId } = req.body;

  await userService.rejectAdmin(bodyId, loginId);
  res.status(200).json({ message: "관리자 가입 거절이 완료되었습니다" });
};

export const approveAllAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const id = request.user.userId;

  await userService.approveAllAdmins(id);
  res.status(200).json({ message: "관리자 가입 전체 승인이 완료되었습니다" });
};

export const rejectAllAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const id = request.user.userId;

  await userService.rejectAllAdmins(id);
  res.status(200).json({ message: "관리자 가입 전체 거절이 완료되었습니다" });
};

export const approveUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const loginId = request.user.userId;

  const { id: bodyId } = req.params;

  await userService.approveUser(bodyId, loginId);
  res.status(200).json({ message: "사용자 가입 요청 승인 성공" });
};

export const rejectUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const loginId = request.user.userId;

  const { id: bodyId } = req.params;

  await userService.rejectUser(bodyId, loginId);
  res.status(200).json({ message: "사용자 가입 요청 거절 성공" });
};

export const approveAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const id = request.user.userId;

  await userService.approveAllUsers(id);
  res.status(200).json({ message: "사용자 가입 요청 전체 승인 성공" });
};

export const rejectAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const id = request.user.userId;

  await userService.rejectAllUsers(id);
  res.status(200).json({ message: "사용자 가입 요청 전체 거절 성공" });
};
