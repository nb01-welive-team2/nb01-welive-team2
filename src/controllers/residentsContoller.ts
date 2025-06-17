import { Request, Response } from "express";
import { getResidentsList, getResident } from "../services/residentsService";
import { updateResidentInfo } from "../repositories/residentsRepository";

// 입주민 목록 조회
export async function getResidentsListFilteredController(
  req: Request,
  res: Response
) {
  try {
    const residents = await getResidentsList(req.query);
    res.status(200).json(residents);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "입주민 목록 조회 실패" });
  }
}

// 입주민 상세 조회
export async function getResidentByIdController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const resident = await getResident(id);
    if (!resident) {
      throw new Error("해당 입주민의 정보를 찾을 수 없습니다.");
    }
    res.status(200).json(resident);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "입주민 상세 조회 실패" });
  }
}

// 입주민 정보 수정
export async function updateResidentInfoController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const resident = await updateResidentInfo(id, data);
    res.status(200).json(resident);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "입주민 정보 수정 실패" });
  }
}
