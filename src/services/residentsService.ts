import { Residents } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { ResidentsFilter } from "../types/residents";
import residentsRepository from "../repositories/residentsRepository";

// 입주민 정보 개별 등록
async function uploadResident(data: Prisma.ResidentsCreateInput) {
  const resident = await residentsRepository.createResident(data);
  return resident;
}

// 입주민 목록 조회
async function getResidentsList(query: ResidentsFilter) {
  const residents = await residentsRepository.getResidentsFiltered(query);
  return residents;
}

// 입주민 상세 조회
async function getResident(id: string) {
  const resident = await residentsRepository.getResidentById(id);
  return resident;
}

// 입주민 정보 수정
async function patchResident(id: string, data: Partial<Residents>) {
  const resident = await residentsRepository.updateResidentInfo(id, data);
  return resident;
}

// 입주민 정보 삭제
async function removeResident(id: string) {
  return await residentsRepository.deleteResident(id);
}

export default {
  removeResident,
  patchResident,
  getResident,
  getResidentsList,
  uploadResident,
};
