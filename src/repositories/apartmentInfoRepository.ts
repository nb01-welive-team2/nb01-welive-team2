import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function findUnique(params: Prisma.ApartmentInfoFindUniqueArgs) {
  return await prisma.apartmentInfo.findUnique({ ...params });
}

export default {
  findUnique,
};
