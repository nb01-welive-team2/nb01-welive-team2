import { create } from "superstruct";
import { Request, Response } from "express";
import residentsService from "../services/residentsService";
import CommonError from "../errors/CommonError";
import {
  createResidentBodyStruct,
  UpdateResidentBodyStruct,
} from "../structs/residentStruct";
import { AuthenticatedRequest } from "@/types/express";
import residentsRepository from "@/repositories/residentsRepository";

// 입주민 명부 개별 등록
export async function uploadResidentController(req: Request, res: Response) {
  const { apartmentId } = (req as AuthenticatedRequest).user;
  const data = create(req.body, createResidentBodyStruct);

  const residents = await residentsService.uploadResident({
    ...data,
    email: data.email ?? "",
    apartmentId,
  });

  res.status(201).json(residents);
}

// 입주민 목록 조회
export async function getResidentsListFilteredController(
  req: Request,
  res: Response
) {
  const { apartmentId } = (req as AuthenticatedRequest).user;
  const residents = await residentsService.getResidentsList({
    ...req.query,
    apartmentId,
  });

  res.status(200).json(residents);
}

// 입주민 상세 조회
export async function getResidentByIdController(req: Request, res: Response) {
  const { id } = req.params;
  const { apartmentId } = (req as AuthenticatedRequest).user;

  await residentsService.residentAccessCheck(id, apartmentId);
  const resident = await residentsService.getResident(id);

  res.status(200).json(resident);
}

// 입주민 정보 수정
export async function updateResidentInfoController(
  req: Request,
  res: Response
) {
  const { id } = req.params;
  const { apartmentId } = (req as AuthenticatedRequest).user;

  const data = create(req.body, UpdateResidentBodyStruct);
  await residentsService.residentAccessCheck(id, apartmentId);
  const resident = await residentsService.patchResident(id, data);

  res.status(200).json(resident);
}

// 입주민 정보 삭제
export async function deleteResidentController(req: Request, res: Response) {
  const { id } = req.params;
  const { apartmentId } = (req as AuthenticatedRequest).user;

  await residentsService.residentAccessCheck(id, apartmentId);
  await residentsService.removeResident(id);

  res.status(200).json({ message: "입주민 정보 삭제 성공" });
}
