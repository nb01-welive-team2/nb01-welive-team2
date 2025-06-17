import {
  getResidentsFiltered,
  getResidentById,
} from "../repositories/residentsRepository";
import { ResidentsFilter } from "../types/residents";

// 입주민 목록 조회
export async function getResidentsList(query: ResidentsFilter) {
  return await getResidentsFiltered(query);
}

// 입주민 상세 조회
export async function getResident(id: string) {
  return await getResidentById(id);
}
