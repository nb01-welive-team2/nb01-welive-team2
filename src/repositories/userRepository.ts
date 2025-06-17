import { prisma } from "../lib/prisma";

export const getUserByUsername = async (username: string) => {
  const user = await prisma.users.findUnique({
    where: { username },
  });

  return user;
};
