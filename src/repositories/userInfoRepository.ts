import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function findByUserId(userId: string) {
  return await prisma.userInfo.findUnique({
    where: {
      userId: userId,
    },
  });
}

async function findUnique(params: Prisma.UserInfoFindUniqueArgs) {
  return await prisma.userInfo.findUnique({ ...params });
}

export default {
  findByUserId,
  findUnique,
};
