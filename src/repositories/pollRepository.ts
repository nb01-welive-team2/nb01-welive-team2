import { prisma } from "../lib/prisma";
import { $Enums } from "@prisma/client";

export const findPolls = async (where: any, skip: number, take: number) => {
  return await prisma.polls.findMany({
    where,
    include: {
      pollOptions: true,
      user: true,
    },
    skip,
    take,
    orderBy: {
      startDate: "desc",
    },
  });
};

export const createPollEntry = async (data: {
  articleId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  buildingPermission: number;
  userId: string;
  apartmentId: string;
}) => {
  return await prisma.polls.create({
    data: {
      title: data.title,
      content: data.description || "",
      startDate: data.startDate,
      endDate: data.endDate,
      buildingPermission: data.buildingPermission,
      status: $Enums.POLL_STATUS.IN_PROGRESS,
      userId: data.userId,
      apartmentId: data.apartmentId,
    },
    include: {
      user: true,
    },
  });
};

export const createPollOptions = async (pollId: string, options: string[]) => {
  await Promise.all(
    options.map((option) =>
      prisma.pollOptions.create({
        data: {
          pollId,
          title: option,
        },
      })
    )
  );
};

export const findPollById = async (pollId: string) => {
  return await prisma.polls.findUnique({
    where: { id: pollId },
    include: {
      pollOptions: true,
      user: true,
    },
  });
};

export const getApartmentIdByPollId = async (
  pollId: string
): Promise<string | null> => {
  const poll = await prisma.polls.findUnique({
    where: { id: pollId },
    include: {
      user: {
        include: {
          userInfo: true,
        },
      },
    },
  });

  return poll?.user?.userInfo?.apartmentId ?? null;
};

export const isUserInApartment = async (
  userId: string,
  apartmentId: string
): Promise<boolean> => {
  const userInfo = await prisma.userInfo.findFirst({
    where: {
      userId,
      apartmentId,
    },
  });

  return !!userInfo;
};

export const findPollByIdWithVotes = async (pollId: string) => {
  return await prisma.polls.findUnique({
    where: { id: pollId },
    include: {
      pollOptions: {
        include: {
          votes: true,
        },
      },
    },
  });
};

export const getUserDongNumber = async (
  userId: string
): Promise<number | null> => {
  const userInfo = await prisma.userInfo.findFirst({
    where: { userId },
  });

  return userInfo?.apartmentDong ?? null;
};

export const findPollForEdit = async (pollId: string) => {
  return await prisma.polls.findUnique({
    where: { id: pollId },
  });
};

export const updatePoll = async (
  pollId: string,
  data: {
    title: string;
    startDate: Date;
    endDate: Date;
    buildingPermission: number;
    status: $Enums.POLL_STATUS;
  }
) => {
  return await prisma.polls.update({
    where: { id: pollId },
    data: {
      title: data.title,
      startDate: data.startDate,
      endDate: data.endDate,
      buildingPermission: data.buildingPermission,
      status: data.status,
    },
    include: {
      user: true,
    },
  });
};

export const replacePollOptions = async (pollId: string, options: string[]) => {
  await prisma.pollOptions.deleteMany({ where: { pollId } });
  await createPollOptions(pollId, options);
};

export const findPollWithAuthor = async (pollId: string) => {
  return await prisma.polls.findUnique({
    where: { id: pollId },
    include: {
      user: true,
    },
  });
};

export const deletePollById = async (pollId: string) => {
  await prisma.pollOptions.deleteMany({ where: { pollId } });
  await prisma.polls.delete({ where: { id: pollId } });
};
