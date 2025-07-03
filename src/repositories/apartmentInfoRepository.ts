import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function findUnique(params: Prisma.ApartmentInfoFindUniqueArgs) {
  return await prisma.apartmentInfo.findUnique({ ...params });
}

async function findById(id: string) {
  return await prisma.apartmentInfo.findUnique({ where: { id } });
}

async function findApartmentsList(
  where: Prisma.ApartmentInfoWhereInput,
  isAuthenticated: boolean
) {
  return await prisma.apartmentInfo.findMany({
    where,
    select: isAuthenticated
      ? undefined
      : { id: true, apartmentName: true, apartmentAddress: true },
  });
}

export default {
  findUnique,
  findApartmentsList,
  findById,
};
