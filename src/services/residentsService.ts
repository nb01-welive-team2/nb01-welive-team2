import { Residents } from "@prisma/client";
import { Prisma } from "@prisma/client";
import {
  getResidentsFiltered,
  getResidentById,
  updateResidentInfo,
  deleteResident,
  createResident,
} from "../repositories/residentsRepository";
import { ResidentsFilter } from "../types/residents";

// 입주민 정보 개별 등록
export async function uploadResident(data: Prisma.ResidentsCreateInput) {
  const resident = await createResident(data);
  return resident;
}

// 입주민 목록 조회
export async function getResidentsList(query: ResidentsFilter) {
  const residents = await getResidentsFiltered(query);
  return residents;
}

// 입주민 상세 조회
export async function getResident(id: string) {
  const resident = await getResidentById(id);
  return resident;
}

// 입주민 정보 수정
export async function patchResident(id: string, data: Partial<Residents>) {
  const resident = await updateResidentInfo(id, data);
  return resident;
}

// 입주민 정보 삭제
export async function removeResident(id: string) {
  return await deleteResident(id);
}
