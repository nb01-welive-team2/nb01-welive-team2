import { APPROVAL_STATUS, RESIDENCE_STATUS } from "@prisma/client";
import {
  UpdateResidentDataDto,
  ResidentUploadInputDto,
} from "../dto/residents.dto";
import { ResidentsFilter } from "../types/residents";
import residentsRepository from "../repositories/residentsRepository";
import CommonError from "@/errors/CommonError";

// 입주민 정보 개별 등록
async function uploadResident(data: ResidentUploadInputDto) {
  const { apartmentId, ...rest } = data;
  const resident = await residentsRepository.createResident({
    ...rest,
    residenceStatus: RESIDENCE_STATUS.RESIDENCE,
    isRegistered: false,
    approvalStatus: APPROVAL_STATUS.PENDING,
    apartmentInfo: {
      connect: {
        id: data.apartmentId,
      },
    },
  });
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
async function patchResident(id: string, data: UpdateResidentDataDto) {
  const resident = await residentsRepository.updateResidentInfo(id, data);
  return resident;
}

// 입주민 정보 삭제
async function removeResident(id: string) {
  return await residentsRepository.deleteResident(id);
}

// 입주민 관리자 권한 체크
async function residentAccessCheck(id: string, apartmentId: string) {
  const resident = await residentsRepository.getResidentById(id);
  if (!resident || resident.apartmentId !== apartmentId) {
    throw new CommonError("해당 입주민에 대한 권한이 없습니다.", 403);
  }
}

export default {
  removeResident,
  patchResident,
  getResident,
  getResidentsList,
  uploadResident,
  residentAccessCheck,
};
