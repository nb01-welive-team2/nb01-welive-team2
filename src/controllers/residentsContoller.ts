import { create } from "superstruct";
import { Request, Response } from "express";
import CommonError from "@/errors/CommonError";
import residentsService from "../services/residentsService";
import {
  createResidentBodyStruct,
  UpdateResidentBodyStruct,
} from "../structs/residentStruct";
import { AuthenticatedRequest } from "@/types/express";
import { fileExistsAsync } from "tsconfig-paths/lib/filesystem";

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

// 입주민 명부 CSV파일 업로드
export async function uploadResidentsCsvController(
  req: Request,
  res: Response
) {
  const user = (req as AuthenticatedRequest).user;
  if (!user) throw new CommonError("인증되지 않은 사용자입니다.", 401);

  const apartmentId = user.apartmentId;
  if (!apartmentId) throw new CommonError("아파트 정보가 없습니다.", 400);

  if (!req.file) throw new CommonError("CSV 파일이 없습니다.", 400);

  const csvText = req.file.buffer.toString("utf-8");

  const createdResidents = await residentsService.uploadResidentsFromCsv(
    csvText,
    apartmentId
  );

  res.status(201).json({
    message: "입주민 명부 업로드 성공",
    data: createdResidents,
  });
}

// 입주민 명부 CSV 파일 다운로드
export async function downloadResidentsCsvController(
  req: Request,
  res: Response
) {
  const user = (req as AuthenticatedRequest).user;
  if (!user) throw new CommonError("인증되지 않은 사용자입니다.", 401);

  const apartmentId = user.apartmentId;
  if (!apartmentId) throw new CommonError("아파트 정보가 없습니다.", 400);

  const csv = await residentsService.getResidentsCsv({ apartmentId });
  const filename = "residents.csv";

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(csv);
}

// 입주민 명부 CSV 템플릿 다운로드
export async function downloadResidentsCsvTemplateController(
  req: Request,
  res: Response
) {
  const user = (req as AuthenticatedRequest).user;
  if (!user) throw new CommonError("인증되지 않은 사용자입니다.", 401);

  const apartmentId = user.apartmentId;
  if (!apartmentId) throw new CommonError("아파트 정보가 없습니다.", 400);
  const csv = await residentsService.getResidentsCsvTemplate();
  const filename = "resident-form.csv";

  res.header("Content-Type", "text/csv; charset=utf-8");
  res.header("Content-Disposition", `attachment; filename="${filename}"`);

  res.status(200).send(csv);
}
