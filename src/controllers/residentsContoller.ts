import { Request, Response } from "express";
import { getResidentsList } from "../services/residentsService";

export async function getResidentsListFiltered(req: Request, res: Response) {
  try {
    const residents = await getResidentsList(req.query);
    res.status(200).json(residents);
  } catch (error) {
    res.status(400).json({ message: "입주민 목록 조회 실패" });
  }
}
