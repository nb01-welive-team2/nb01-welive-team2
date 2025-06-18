import { NextFunction, Request, Response } from "express";
import residentsService from "../services/residentsService";

// 입주민 명부 개별 등록
export async function uploadResidentController(req: Request, res: Response) {
  const apartmentId = req.user?.apartmentId;
  const data = req.body;

  const residents = await residentsService.uploadResident({
    ...data,
    apartmentInfo: {
      connect: { id: apartmentId },
    },
  });

  res.status(201).json(residents);
}

// 입주민 목록 조회
export async function getResidentsListFilteredController(
  req: Request,
  res: Response
) {
  const residents = await residentsService.getResidentsList(req.query);
  res.status(200).json(residents);
}

// 입주민 상세 조회
export async function getResidentByIdController(req: Request, res: Response) {
  const { id } = req.params;
  const resident = await residentsService.getResident(id);
  if (!resident) {
    throw new Error("해당 입주민의 정보를 찾을 수 없습니다.");
  }
  res.status(200).json(resident);
}

// 입주민 정보 수정
export async function updateResidentInfoController(
  req: Request,
  res: Response
) {
  const { id } = req.params;
  const { data } = req.body;
  const resident = await residentsService.patchResident(id, data);
  res.status(200).json(resident);
}

// 입주민 정보 삭제
export async function deleteResidentController(req: Request, res: Response) {
  const { id } = req.params;
  await residentsService.removeResident(id);
  res.status(200).json({ message: "입주민 정보 삭제 성공" });
}
