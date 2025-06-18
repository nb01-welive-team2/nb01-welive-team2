import { prisma } from "../lib/prisma";

export const getUserByUsername = async (username: string) => {
  const user = await prisma.users.findUnique({
    where: { username },
    include: {
      apartmentInfo: {
        select: { id: true },
      },
    },
  });

  return user;
};

export const getUserId = async (id: string) => {
  const user = await prisma.users.findUnique({
    where: { id },
    include: {
      apartmentInfo: {
        select: { id: true },
      },
    },
  });
  return user;
};
