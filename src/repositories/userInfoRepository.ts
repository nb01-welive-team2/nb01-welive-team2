import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function findByUserId(userId: string) {
  return await prisma.userInfo.findUnique({
    where: {
      id: userId,
    },
  });
}

export default {
  findByUserId,
};
