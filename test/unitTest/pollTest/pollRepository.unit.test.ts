import * as pollRepo from "@/repositories/pollRepository";
import { prisma } from "@/lib/prisma";
import { Prisma, $Enums } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    userInfo: {
      findFirst: jest.fn(),
    },
    polls: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    pollOptions: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    users: {
      findFirst: jest.fn(),
    },
    events: {
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("pollRepository", () => {
  it("createPollEntry: 투표 등록", async () => {
    const mockPoll = {
      id: "poll-id",
      title: "투표 제목",
      content: "설명",
      status: "IN_PROGRESS",
      buildingPermission: 0,
      userId: "user-id",
      apartmentId: "apt-100",
      eventId: "event-123",
      user: { name: "관리자" },
    };

    (prisma.polls.create as jest.Mock).mockResolvedValue(mockPoll);

    const data = {
      articleId: "article-id",
      title: "투표 제목",
      content: "내용",
      startDate: new Date(),
      endDate: new Date(),
      buildingPermission: 0,
      userId: "user-id",
      apartmentId: "apt-100",
      eventId: "event-123",
    };

    const result = await pollRepo.createPollEntry(data);

    expect(prisma.polls.create).toHaveBeenCalledWith({
      data: {
        title: data.title,
        content: data.content || "",
        startDate: data.startDate,
        endDate: data.endDate,
        buildingPermission: data.buildingPermission,
        status: $Enums.POLL_STATUS.IN_PROGRESS,
        user: {
          connect: { id: data.userId },
        },
        ApartmentInfo: {
          connect: { id: data.apartmentId },
        },
        event: {
          connect: { id: data.eventId },
        },
      },
      include: {
        user: true,
      },
    });

    expect(result).toEqual(mockPoll);
  });

  it("findPollByIdWithVotes: 옵션 + 투표 포함 조회", async () => {
    const mockPollId = "poll-abc";
    const mockPoll = {
      id: mockPollId,
      title: "투표 제목",
      pollOptions: [
        {
          content: "찬성",
          votes: [{ userId: "user1" }, { userId: "user2" }],
        },
        {
          content: "반대",
          votes: [],
        },
      ],
    };

    (prisma.polls.findUnique as jest.Mock).mockResolvedValue(mockPoll);

    const result = await pollRepo.findPollByIdWithVotes(mockPollId);

    expect(prisma.polls.findUnique).toHaveBeenCalledWith({
      where: { id: mockPollId },
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

    expect(result).toEqual(mockPoll);
  });
});

it("createPollOptions: 투표 옵션 생성", async () => {
  await pollRepo.createPollOptions("poll-id", [
    { title: "찬성" },
    { title: "반대" },
  ]);

  expect(prisma.pollOptions.create).toHaveBeenCalledWith({
    data: {
      poll: { connect: { id: "poll-id" } },
      title: "찬성",
    },
  });
  expect(prisma.pollOptions.create).toHaveBeenCalledWith({
    data: {
      poll: { connect: { id: "poll-id" } },
      title: "반대",
    },
  });
});

it("replacePollOptions: 투표 옵션 교체", async () => {
  (prisma.pollOptions.deleteMany as jest.Mock).mockResolvedValue(undefined);
  (prisma.pollOptions.create as jest.Mock).mockResolvedValue(undefined);

  await pollRepo.replacePollOptions("poll-id", [
    { title: "찬성" },
    { title: "반대" },
  ]);

  expect(prisma.pollOptions.deleteMany).toHaveBeenCalledWith({
    where: { pollId: "poll-id" },
  });
  expect(prisma.pollOptions.create).toHaveBeenCalledTimes(2);
});

it("deletePollById: 투표 삭제", async () => {
  (prisma.polls.delete as jest.Mock).mockResolvedValue({ id: "poll-1" });

  const result = await pollRepo.deletePollById("poll-1");

  expect(prisma.polls.delete).toHaveBeenCalledWith({
    where: { id: "poll-1" },
  });
  expect(result).toEqual({ id: "poll-1" });
});

it("updatePoll: 투표 수정", async () => {
  const mockUpdatedPoll = {
    id: "poll-id",
    title: "수정된 제목",
    content: "수정된 설명",
    status: "CLOSED",
    user: { name: "관리자" },
    startDate: new Date(),
    endDate: new Date(),
  };

  (prisma.polls.update as jest.Mock).mockResolvedValue(mockUpdatedPoll);

  const result = await pollRepo.updatePoll("poll-id", {
    title: "수정된 제목",
    content: "내용",
    startDate: new Date(),
    endDate: new Date(),
    buildingPermission: 1,
    status: "CLOSED",
  });

  expect(prisma.polls.update).toHaveBeenCalledWith({
    where: { id: "poll-id" },
    data: expect.any(Object),
    include: { user: true },
  });
  expect(result).toEqual(mockUpdatedPoll);
});

it("findPollWithAuthor: 작성자 포함 조회", async () => {
  const mockPoll = {
    id: "poll-123",
    userId: "user-abc",
    startDate: new Date("2025-06-25T06:05:19.074Z"),
    user: {
      name: "관리자",
    },
  };

  (prisma.polls.findUnique as jest.Mock).mockResolvedValue(mockPoll);

  const result = await pollRepo.findPollWithAuthor("poll-123");

  expect(prisma.polls.findUnique).toHaveBeenCalledWith({
    where: { id: "poll-123" },
    include: { user: true },
  });

  expect(result).toEqual(mockPoll);
});

it("getApartmentIdByPollId: 아파트 ID 조회", async () => {
  const mockApartmentId = "apt-100";

  (prisma.polls.findUnique as jest.Mock).mockResolvedValue({
    apartmentId: mockApartmentId,
  });

  const result = await pollRepo.getApartmentIdByPollId("poll-100");

  expect(prisma.polls.findUnique).toHaveBeenCalledWith({
    where: { id: "poll-100" },
    select: { apartmentId: true },
  });

  expect(result).toBe(mockApartmentId);
});

it("isUserInApartment: 유저가 아파트에 속해 있는지 확인", async () => {
  (prisma.userInfo.findFirst as jest.Mock).mockResolvedValue({});

  const result = await pollRepo.isUserInApartment("user-abc", "apt-100");

  expect(prisma.userInfo.findFirst).toHaveBeenCalledWith({
    where: {
      userId: "user-abc",
      apartmentId: "apt-100",
    },
  });

  expect(result).toBe(true);
});

it("getUserDongNumber: 유저의 동 번호 반환", async () => {
  (prisma.userInfo.findFirst as jest.Mock).mockResolvedValue({
    apartmentDong: 202,
  });

  const dong = await pollRepo.getUserDongNumber("user-xyz");

  expect(prisma.userInfo.findFirst).toHaveBeenCalledWith({
    where: { userId: "user-xyz" },
    select: { apartmentDong: true },
  });

  expect(dong).toBe(202);
});

it("findPolls: 조건에 맞는 투표 목록 조회", async () => {
  const mockPolls = [
    {
      id: "poll-id",
      title: "투표 제목",
      content: "설명",
      status: "IN_PROGRESS",
      buildingPermission: 0,
      startDate: new Date(),
      endDate: new Date(),
      user: { name: "관리자" },
      pollOptions: [],
    },
  ];

  (prisma.polls.findMany as jest.Mock).mockResolvedValue(mockPolls);

  const where = { status: "IN_PROGRESS" };
  const skip = 0;
  const take = 10;

  const result = await pollRepo.findPolls(where, skip, take);

  expect(prisma.polls.findMany).toHaveBeenCalledWith({
    where,
    include: {
      user: true,
      pollOptions: true,
    },
    skip,
    take,
    orderBy: {
      startDate: "desc",
    },
  });

  expect(result).toEqual(mockPolls);
});

it("updatePoll: 투표 수정", async () => {
  const pollId = "poll-123";
  const updateData = {
    title: "수정된 제목",
    content: "새로운 내용",
    startDate: new Date("2025-07-01T00:00:00.000Z"),
    endDate: new Date("2025-07-02T00:00:00.000Z"),
    buildingPermission: 1,
    status: $Enums.POLL_STATUS.CLOSED,
  };

  (prisma.polls.update as jest.Mock).mockResolvedValue({
    id: pollId,
    ...updateData,
  });

  const result = await pollRepo.updatePoll(pollId, updateData);

  expect(prisma.polls.update).toHaveBeenCalledWith({
    where: { id: pollId },
    data: updateData,
    include: { user: true },
  });

  expect(result).toEqual({
    id: pollId,
    ...updateData,
  });
});

it("findPollForEdit: 수정용 투표 정보 조회", async () => {
  const pollId = "poll-456";

  const mockPoll = {
    id: pollId,
    userId: "user-123",
    startDate: new Date("2025-07-01T00:00:00.000Z"),
  };

  (prisma.polls.findUnique as jest.Mock).mockResolvedValue(mockPoll);

  const result = await pollRepo.findPollForEdit(pollId);

  expect(prisma.polls.findUnique).toHaveBeenCalledWith({
    where: { id: pollId },
  });

  expect(result).toEqual(mockPoll);
});

it("createEvent: 이벤트 생성", async () => {
  const mockEvent = {
    id: "event-123",
    eventType: $Enums.EVENT_TYPE.POLL,
    isActive: true,
  };

  (prisma.events.create as jest.Mock).mockResolvedValue(mockEvent);

  const data = {
    eventType: $Enums.EVENT_TYPE.POLL,
    isActive: true,
  };

  const result = await pollRepo.createEvent(data);

  expect(prisma.events.create).toHaveBeenCalledWith({
    data,
  });

  expect(result).toEqual(mockEvent);
});

it("deleteEventById: 이벤트 삭제", async () => {
  const deletedEvent = {
    id: "event-123",
    eventType: $Enums.EVENT_TYPE.POLL,
    isActive: false,
  };

  (prisma.events.delete as jest.Mock).mockResolvedValue(deletedEvent);

  const result = await pollRepo.deleteEventById("event-123");

  expect(prisma.events.delete).toHaveBeenCalledWith({
    where: { id: "event-123" },
  });

  expect(result).toEqual(deletedEvent);
});
