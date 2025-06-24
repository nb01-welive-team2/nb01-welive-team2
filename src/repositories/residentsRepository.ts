import { Residents } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { ResidentsFilter } from "../types/residents";
import { UploadResidentsInput } from "@/dto/residents.dto";
import { RESIDENCE_STATUS, APPROVAL_STATUS } from "@prisma/client";

// 입주민 명부 개별 등록 (관리자)
async function createResident(data: Prisma.ResidentsCreateInput) {
  const resident = await prisma.residents.create({
    data,
  });
  return resident;
}

// 입주민 목록 조회 (관리자)
async function getResidentsFiltered(filters: ResidentsFilter) {
  const {
    apartmentId,
    building,
    unitNumber,
    residenceStatus,
    isRegistered,
    name,
    contact,
  } = filters;

  return prisma.residents.findMany({
    where: {
      apartmentId,
      ...(building && { building }),
      ...(unitNumber && { unitNumber }),
      ...(residenceStatus && { residenceStatus }),
      ...(isRegistered !== undefined && { isRegistered }),
      ...(name && { name: { contains: name } }),
      ...(contact && { contact: { contains: contact } }),
    },
    orderBy: {
      name: "asc",
    },
  });
}

// 입주민 상세 조회 (관리자)
async function getResidentById(id: string) {
  const resident = await prisma.residents.findUnique({
    where: { id },
  });
  return resident;
}

// 입주민 정보 수정 (관리자)
async function updateResidentInfo(id: string, data: Partial<Residents>) {
  const resident = await prisma.residents.update({
    where: { id },
    data,
  });
  return resident;
}

// 입주민 정보 삭제 (관리자)
async function deleteResident(id: string) {
  return await prisma.residents.delete({ where: { id } });
}

// 입주민 명부 CSV 업로드 (관리자)
async function uploadResident(
  tx: Prisma.TransactionClient,
  input: UploadResidentsInput
) {
  return await tx.residents.create({
    data: {
      name: input.name,
      building: input.building,
      unitNumber: input.unitNumber,
      contact: input.contact,
      email: input.email,
      isHouseholder: input.isHouseholder,
      residenceStatus: RESIDENCE_STATUS.RESIDENCE,
      isRegistered: false,
      approvalStatus: APPROVAL_STATUS.PENDING,
      apartmentInfo: {
        connect: { id: input.apartmentId },
      },
    },
  });
}

export default {
  deleteResident,
  updateResidentInfo,
  getResidentById,
  getResidentsFiltered,
  createResident,
  uploadResident,
};
