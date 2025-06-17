import { getResidentsFiltered } from "../repositories/residentsRepository";
import { ResidentsFilter } from "../types/residents";

// 입주민 목록 조회
export async function getResidentsList(query: ResidentsFilter) {
  return await getResidentsFiltered(query);
}
