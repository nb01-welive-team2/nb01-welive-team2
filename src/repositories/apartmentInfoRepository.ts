import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function findUnique(params: Prisma.ApartmentInfoFindUniqueArgs) {
  return await prisma.apartmentInfo.findUnique({ ...params });
}

async function findApartmentsList(query: {
  apartmentName?: string;
  apartmentAddress?: string;
}) {
  const where = {
    ...(query.apartmentName && {
      apartmentName: {
        contains: query.apartmentName,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    ...(query.apartmentAddress && {
      apartmentAddress: {
        contains: query.apartmentAddress,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
  };

  return await prisma.apartmentInfo.findMany({ where });
}

export default {
  findUnique,
  findApartmentsList,
};
