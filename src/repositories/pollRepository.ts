import { prisma } from "../lib/prisma";

export const findPolls = async (where: any, skip: number, take: number) => {
  return await prisma.polls.findMany({
    where,
    include: {
      article: {
        include: {
          user: true, // ← 작성자 이름을 가져오기 위해 포함
        },
      },
      pollOptions: true,
    },
    skip,
    take,
    orderBy: {
      article: {
        createdAt: "desc",
      },
    },
  });
};

export const createPollArticle = async (data: {
  title: string;
  content: string;
  startDate: Date;
  endDate: Date;
  boardId: string;
  userId: string;
}) => {
  return await prisma.articles.create({ data });
};

export const createPollEntry = async (
  articleId: string,
  buildingPermission: number
) => {
  return await prisma.polls.create({
    data: {
      articleId,
      status: "IN_PROGRESS",
      buildingPermission,
    },
  });
};

export const createPollOptions = async (pollId: string, options: string[]) => {
  await Promise.all(
    options.map((option) =>
      prisma.pollOptions.create({
        data: {
          pollId,
          content: option,
        },
      })
    )
  );
};

export const findPollById = async (pollId: string) => {
  return await prisma.polls.findUnique({
    where: { id: pollId },
    include: {
      article: true,
      pollOptions: true,
    },
  });
};

export const getApartmentIdByPollId = async (
  pollId: string
): Promise<string | null> => {
  const poll = await prisma.polls.findUnique({
    where: { id: pollId },
    include: {
      article: {
        include: {
          user: {
            include: {
              userInfo: true,
            },
          },
        },
      },
    },
  });

  const apartmentId = poll?.article?.user?.userInfo[0]?.apartmentId ?? null;
  return apartmentId;
}; // 작성자의 apartmentId 조회

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
}; // 유저가 해당 아파트 구성원인지 확인

export const findPollByIdWithVotes = async (pollId: string) => {
  return await prisma.polls.findUnique({
    where: { id: pollId },
    include: {
      article: true,
      pollOptions: {
        include: {
          votes: true, // 선택한 옵션의 투표 수 조회
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
}; // 아파트 동 정보 조회

export const findPollForEdit = async (pollId: string) => {
  return await prisma.polls.findUnique({
    where: { id: pollId },
    include: {
      article: true,
    },
  });
};

export const updatePollAndArticle = async (
  pollId: string,
  data: {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    buildingPermission: number;
    status: string;
  }
) => {
  const poll = await prisma.polls.update({
    where: { id: pollId },
    data: {
      buildingPermission: data.buildingPermission,
      article: {
        update: {
          title: data.title,
          content: data.description ?? "",
          startDate: data.startDate,
          endDate: data.endDate,
        },
      },
    },
    include: {
      article: true,
    },
  });

  return poll;
};

export const replacePollOptions = async (pollId: string, options: string[]) => {
  await prisma.pollOptions.deleteMany({ where: { pollId } });
  await Promise.all(
    options.map((opt) =>
      prisma.pollOptions.create({ data: { pollId, content: opt } })
    )
  );
};

export const findPollWithAuthor = async (pollId: string) => {
  return await prisma.polls.findUnique({
    where: { id: pollId },
    include: {
      article: true,
    },
  });
};

export const deletePollById = async (pollId: string) => {
  return await prisma.polls.delete({
    where: { id: pollId },
  });
};
