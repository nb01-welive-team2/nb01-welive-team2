import { prisma } from "../lib/prisma";

export const getUserByUsername = async (username: string) => {
  const user = await prisma.users.findUnique({
    where: { username },
  });

  return user;
};

export const getUserId = async (id: string) => {
  const user = await prisma.users.findUnique({
    where: { id },
  });
  return user;
};
