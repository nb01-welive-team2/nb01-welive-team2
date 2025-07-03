import { APPROVAL_STATUS, RESIDENCE_STATUS } from "@prisma/client";
import {
  UpdateResidentDataDto,
  ResidentUploadInputDto,
} from "../dto/residents.dto";
import { ResidentsFilter } from "../types/residents";
import { HOUSEHOLDER_STATUS } from "@prisma/client";
import residentsRepository from "../repositories/residentsRepository";
import CommonError from "@/errors/CommonError";
import { parseResidentsCsv } from "@/lib/utils/parseResidentsCsv";
import { prisma } from "@/lib/prisma";

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
  const formatted = residents.map((resident) => ({
    ...resident,
    userId:
      resident.Users && resident.Users.length > 0 ? resident.Users[0].id : null,
    Users: undefined,
  }));
  return {
    residents: formatted,
    count: formatted.length,
  };
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

// 입주민 명부 CSV 업로드
async function uploadResidentsFromCsv(csvText: string, apartmentId: string) {
  let records;

  records = parseResidentsCsv(csvText);

  const createData = await prisma.$transaction(async (tx) => {
    const createdResidents = [];

    for (const row of records) {
      const { name, building, unitNumber, contact, email, isHouseholder } = row;

      if (!name || !building || !unitNumber || !contact || !email) {
        throw new CommonError(
          `필수 항목 누락: ${JSON.stringify({
            rowData: row,
            missingFields: {
              name: !name,
              building: !building,
              unitNumber: !unitNumber,
              contact: !contact,
              email: !email,
              isHouseholder: !isHouseholder,
            },
          })}`,
          400
        );
      }

      const buildingNumber = Number(building);
      const unitNumberNumber = Number(unitNumber);

      const parsedIsHouseholder =
        isHouseholder === "HOUSEHOLDER"
          ? HOUSEHOLDER_STATUS.HOUSEHOLDER
          : HOUSEHOLDER_STATUS.MEMBER;

      const newResident = await residentsRepository.uploadResident(tx, {
        name,
        building: buildingNumber,
        unitNumber: unitNumberNumber,
        contact,
        email,
        apartmentId,
        isHouseholder: parsedIsHouseholder,
      });

      createdResidents.push(newResident);
    }

    return createdResidents;
  });
  return createData;
}

// 입주민 명부 CSV 다운로드
async function getResidentsCsv(query: ResidentsFilter) {
  const residents = await residentsRepository.getResidentsFiltered(query);

  const headers = [
    "name",
    "building",
    "unitNumber",
    "contact",
    "email",
    "isHouseholder",
  ];
  const rows = residents.map((resident) => [
    resident.name,
    resident.building,
    resident.unitNumber,
    resident.contact,
    resident.email,
    resident.isHouseholder,
  ]);
  const csvString = [headers, ...rows]
    .map((row) => row.map((v) => `"${v}"`).join(","))
    .join("\n");
  return csvString;
}

// 명부 템플릿 다운로드
async function getResidentsCsvTemplate() {
  const headers = [
    "name",
    "building",
    "unitNumber",
    "contact",
    "email",
    "isHouseholder",
  ];
  const csvString = [headers]
    .map((row) => row.map((v) => `"${v}"`).join(","))
    .join("\n");
  return csvString;
}

export default {
  removeResident,
  patchResident,
  getResident,
  getResidentsList,
  uploadResident,
  residentAccessCheck,
  uploadResidentsFromCsv,
  getResidentsCsv,
  getResidentsCsvTemplate,
};
