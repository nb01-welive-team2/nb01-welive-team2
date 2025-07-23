import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function create(vote: Prisma.VotesCreateInput) {
  return await prisma.votes.create({
    data: vote,
  });
}

async function findPollByOptionId(optionId: string) {
  return await prisma.pollOptions.findUnique({
    where: {
      id: optionId,
    },
    include: {
      poll: {
        include: {
          pollOptions: {
            include: {
              votes: true,
              _count: {
                select: {
                  votes: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

async function deleteById(optionId: string, userId: string) {
  return await prisma.votes.delete({
    where: {
      optionId_userId: {
        optionId: optionId,
        userId: userId,
      },
    },
  });
}

export default {
  create,
  findPollByOptionId,
  deleteById,
};
