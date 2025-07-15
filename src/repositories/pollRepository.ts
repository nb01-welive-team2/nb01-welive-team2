import { prisma } from "@/lib/prisma";
import { $Enums, Prisma } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    polls: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    pollOptions: {
      create: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    events: {
      create: jest.fn(),
      delete: jest.fn(),
    },
    userInfo: {
      findFirst: jest.fn(),
    },
  },
}));

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

export const findPollsForEvent = async (params: Prisma.PollsFindManyArgs) => {
  return await prisma.polls.findMany({
    ...params,
    include: {
      event: true,
    },
  });
};

export const createPollEntry = async (data: {
  title: string;
  content: string;
  eventId: string;
  startDate: Date;
  endDate: Date;
  buildingPermission: number;
  userId: string;
  apartmentId: string;
}) => {
  return await prisma.polls.create({
    data: {
      title: data.title,
      content: data.content || "",
      event: { connect: { id: data.eventId } },
      startDate: data.startDate,
      endDate: data.endDate,
      buildingPermission: data.buildingPermission,
      status: $Enums.POLL_STATUS.IN_PROGRESS,
      user: { connect: { id: data.userId } },
      ApartmentInfo: { connect: { id: data.apartmentId } },
    },
    include: {
      user: true,
    },
  });
};

export const createPollOptions = async (
  pollId: string,
  options: { title: string }[]
) => {
  await Promise.all(
    options.map((option) =>
      prisma.pollOptions.create({
        data: {
          poll: { connect: { id: pollId } },
          title: option.title,
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

export const getApartmentIdByPollId = async (
  pollId: string
): Promise<string | null> => {
  const poll = await prisma.polls.findUnique({
    where: { id: pollId },
    select: {
      apartmentId: true,
    },
  });

  return poll?.apartmentId ?? null;
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
      user: {
        include: {
          userInfo: true,
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
    select: { apartmentDong: true },
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
    content: string;
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
      content: data.content,
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

export const updatePollForEvent = async (
  pollId: string,
  data: Prisma.PollsUpdateInput
) => {
  return await prisma.polls.update({
    where: { id: pollId },
    data,
  });
};

export const replacePollOptions = async (
  pollId: string,
  options: { title: string }[]
) => {
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
  return await prisma.polls.delete({
    where: { id: pollId },
  });
};

// 일정 관련
export const createEvent = async (data: {
  eventType: $Enums.EVENT_TYPE;
  isActive: boolean;
}) => {
  return await prisma.events.create({ data });
};

export const deleteEventById = async (eventId: string) => {
  return await prisma.events.delete({ where: { id: eventId } });
};
