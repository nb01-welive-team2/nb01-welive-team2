import { prisma } from "../lib/prisma";
import { ResidentsFilter } from "../types/residents";

// 입주민 목록 조회 (관리자)
export async function getResidentsFiltered(filters: ResidentsFilter) {
  const { building, unitNumber, residenceStatus, isRegistered, name, contact } =
    filters;

  return prisma.residents.findMany({
    where: {
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
export async function getResidentById(id: string) {
  const resident = await prisma.residents.findUnique({
    where: { id },
  });
  return resident;
}
