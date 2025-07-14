import * as pollService from "@/services/pollService";
import * as pollRepo from "@/repositories/pollRepository";
import { CreatePollRequestDto, UpdatePollRequestDto } from "@/dto/pollDto";
import NotFoundError from "@/errors/NotFoundError";
import ForbiddenError from "@/errors/ForbiddenError";
import { $Enums } from "@prisma/client";

jest.mock("@/repositories/pollRepository");

// 투표 등록 테스트
describe("pollService.createPoll", () => {
  const mockUserId = "user-uuid";
  const apartmentId = "test-apartment-id-123";
  const eventId = "event-uuid";
  const pollId = "poll-uuid";
  const mockDto: CreatePollRequestDto = {
    boardId: "9f3a1e30-0f6e-4a9a-b3d4-cb0a978b0fd6",
    apartmentId: "apartment-uuid",
    title: "테스트 투표",
    content: "테스트 설명",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 3600000).toISOString(),
    options: [{ title: "찬성" }, { title: "반대" }],
    buildingPermission: 0,
    status: $Enums.POLL_STATUS.IN_PROGRESS,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a poll and return expected structure", async () => {
    (pollRepo.createEvent as jest.Mock).mockResolvedValue({ id: eventId });
    (pollRepo.createPollEntry as jest.Mock).mockResolvedValue({
      id: pollId,
      title: mockDto.title,
      content: mockDto.content,
      startDate: new Date(mockDto.startDate),
      endDate: new Date(mockDto.endDate),
      buildingPermission: mockDto.buildingPermission,
      status: mockDto.status,
      user: { name: "관리자" },
    });
    (pollRepo.createPollOptions as jest.Mock).mockResolvedValue(undefined);

    await pollService.createPoll(mockDto, mockUserId, apartmentId);
    // 이벤트 생성 테스트
    expect(pollRepo.createEvent).toHaveBeenCalledWith({
      eventType: $Enums.EVENT_TYPE.POLL,
      isActive: true,
    });
    // 이벤트 ID 포함된 투표 생성
    expect(pollRepo.createPollEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        title: mockDto.title,
        content: mockDto.content,
        eventId: eventId,
      })
    );
    // 옵션 생성
    expect(pollRepo.createPollOptions).toHaveBeenCalledWith(
      pollId,
      mockDto.options
    );
  });

  it("should throw an error if options are empty", async () => {
    const invalidDto = { ...mockDto, options: [] };

    await expect(
      pollService.createPoll(invalidDto, mockUserId, apartmentId)
    ).rejects.toThrow();
  });
});

// 투표 전체조회 테스트
describe("pollService.getPollList", () => {
  it("should return formatted poll list without filters", async () => {
    (pollRepo.findPolls as jest.Mock).mockResolvedValue([
      {
        id: "poll-id",
        status: "IN_PROGRESS",
        buildingPermission: 0,
        title: "투표 제목",
        content: "투표 설명",
        pollOptions: [{ content: "찬성" }, { content: "반대" }],
        user: { name: "관리자" },
        startDate: new Date(),
        endDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await pollService.getPollList({
      page: 1,
      limit: 10,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "poll-id",
      title: "투표 제목",
      status: "IN_PROGRESS",
      buildingPermission: 0,
      options: ["찬성", "반대"],
      startDate: expect.any(String),
      endDate: expect.any(String),
    });
  });

  it("should apply keyword filter", async () => {
    (pollRepo.findPolls as jest.Mock).mockImplementation((where) => {
      expect(where).toMatchObject({
        title: {
          contains: "검색어",
          mode: "insensitive",
        },
      });
      return [];
    });

    await pollService.getPollList({
      page: 1,
      limit: 10,
      keyword: "검색어",
    });
  });

  it("should apply status filter", async () => {
    (pollRepo.findPolls as jest.Mock).mockImplementation((where) => {
      expect(where.status).toBe("IN_PROGRESS");
      return [];
    });

    await pollService.getPollList({
      page: 1,
      limit: 10,
      status: "IN_PROGRESS",
    });
  });
});

// 페이지네이션
it("should apply pagination correctly", async () => {
  const mockFn = jest.fn().mockResolvedValue([]);
  (pollRepo.findPolls as jest.Mock).mockImplementation((where, skip, take) => {
    mockFn(skip, take);
    return [];
  });

  await pollService.getPollList({
    page: 2,
    limit: 5,
  });

  expect(mockFn).toHaveBeenCalledWith(5, 5);
});

// 권한 조건 필터링
it("should apply userId for filtering if provided", async () => {
  (pollRepo.findPolls as jest.Mock).mockImplementation((where) => {
    expect(where.userId).toBe("user-123");
    return [];
  });

  await pollService.getPollList({
    page: 1,
    limit: 10,
    userId: "user-123",
    role: "ADMIN",
  });
});

// 투표 상세조회 테스트
describe("pollService.getPoll", () => {
  const mockPollId = "poll-123";
  const mockUserId = "user-456";

  it("should return poll detail if found", async () => {
    (pollRepo.findPollByIdWithVotes as jest.Mock).mockResolvedValue({
      id: mockPollId,
      title: "투표 제목",
      content: "설명",
      status: "IN_PROGRESS",
      startDate: new Date(),
      endDate: new Date(),
      pollOptions: [
        { content: "찬성", votes: [] },
        { content: "반대", votes: [] },
      ],
      user: { id: mockUserId },
      userInfo: [],
    });

    const result = await pollService.getPoll(mockPollId, mockUserId);

    expect(result).toMatchObject({
      id: mockPollId,
      title: "투표 제목",
      description: "설명",
      options: [
        { content: "찬성", voteCount: 0 },
        { content: "반대", voteCount: 0 },
      ],
    });
  });
});

it("should set showResult to true if poll is closed", async () => {
  (pollRepo.findPollByIdWithVotes as jest.Mock).mockResolvedValue({
    id: "poll-closed",
    title: "마감된 투표",
    content: "마감 설명",
    status: "CLOSED",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-10"),
    pollOptions: [
      { content: "찬성", votes: [{ id: "v1" }] },
      { content: "반대", votes: [{ id: "v2" }] },
    ],
    user: { id: "admin" },
    userInfo: [],
  });

  (pollRepo.getApartmentIdByPollId as jest.Mock).mockResolvedValue("apt-id");
  (pollRepo.isUserInApartment as jest.Mock).mockResolvedValue(true);

  const result = await pollService.getPoll("poll-closed", "admin");

  expect(result.showResult).toBe(true);
  expect(result.options).toEqual([
    { content: "찬성", voteCount: 1 },
    { content: "반대", voteCount: 1 },
  ]);
});

it("should set canVote to true when poll is in progress and user is eligible", async () => {
  const now = new Date();
  const startDate = new Date(now.getTime() - 1000); // 1초 전
  const endDate = new Date(now.getTime() + 1000); // 1초 후

  (pollRepo.findPollByIdWithVotes as jest.Mock).mockResolvedValue({
    id: "poll-789",
    title: "진행 중 투표",
    content: "진행 설명",
    status: "IN_PROGRESS",
    startDate,
    endDate,
    pollOptions: [{ content: "찬성", votes: [] }],
    user: { id: "admin" },
    userInfo: [],
  });

  (pollRepo.getApartmentIdByPollId as jest.Mock).mockResolvedValue("apt-id");
  (pollRepo.isUserInApartment as jest.Mock).mockResolvedValue(true);

  const result = await pollService.getPoll("poll-789", "user-456");

  expect(result.canVote).toBe(true);
});

it("should set showResult to false when poll is not closed", async () => {
  const now = new Date();
  const startDate = new Date(now.getTime() - 1000); // 1초 전
  const endDate = new Date(now.getTime() + 60 * 1000); // 1분 후

  (pollRepo.findPollByIdWithVotes as jest.Mock).mockResolvedValue({
    id: "poll-101",
    title: "진행 중 투표",
    content: "내용",
    status: "IN_PROGRESS",
    startDate,
    endDate,
    pollOptions: [
      { content: "찬성", votes: [] },
      { content: "반대", votes: [] },
    ],
    user: { id: "admin" },
    userInfo: [],
  });

  (pollRepo.getApartmentIdByPollId as jest.Mock).mockResolvedValue("apt-001");
  (pollRepo.isUserInApartment as jest.Mock).mockResolvedValue(true);

  const result = await pollService.getPoll("poll-101", "user-456");

  expect(result.showResult).toBe(false);
});

it("should set isEligible to false if user is not in apartment", async () => {
  const now = new Date();
  const startDate = new Date(now.getTime() - 1000);
  const endDate = new Date(now.getTime() + 60 * 1000);

  (pollRepo.findPollByIdWithVotes as jest.Mock).mockResolvedValue({
    id: "poll-999",
    title: "비권한 사용자 테스트",
    content: "내용",
    status: "IN_PROGRESS",
    startDate,
    endDate,
    pollOptions: [
      { content: "찬성", votes: [] },
      { content: "반대", votes: [] },
    ],
    user: { id: "admin" },
    userInfo: [],
  });

  (pollRepo.getApartmentIdByPollId as jest.Mock).mockResolvedValue("apt-002");
  (pollRepo.isUserInApartment as jest.Mock).mockResolvedValue(false); // ❗ 핵심

  const result = await pollService.getPoll("poll-999", "user-no-access");

  expect(result.isEligible).toBe(false);
});

// 투표 수정 테스트
it("should update the poll if user is owner and poll has not started", async () => {
  const mockPoll = {
    id: "poll-123",
    userId: "user-abc",
    startDate: new Date(Date.now() + 1000),
    user: { name: "테스트유저" },
    status: "IN_PROGRESS",
    content: "설명",
    title: "제목",
    buildingPermission: 0,
    pollOptions: [],
  };

  (pollRepo.findPollForEdit as jest.Mock).mockResolvedValue(mockPoll);
  (pollRepo.updatePoll as jest.Mock).mockResolvedValue({
    id: "poll-123",
    title: "수정된 제목",
    content: "수정된 설명",
    status: "IN_PROGRESS",
    buildingPermission: 0,
    startDate: new Date(),
    endDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { name: "테스트유저" },
    pollOptions: [],
    userId: "user-abc",
  });

  const dto: UpdatePollRequestDto = {
    title: "수정된 제목",
    content: "수정된 설명",
    startDate: new Date(Date.now() + 10000).toISOString(),
    endDate: new Date(Date.now() + 20000).toISOString(),
    buildingPermission: 0,
    options: [{ title: "옵션1" }, { title: "옵션2" }],
    status: "IN_PROGRESS",
  };

  const result = await pollService.editPoll(
    "poll-123",
    dto,
    "user-abc",
    "USER"
  );

  expect(result.title).toBe("수정된 제목");
  expect(result.content).toBe("수정된 설명");
});

it("should throw NotFoundError if poll is not found", async () => {
  (pollRepo.findPollForEdit as jest.Mock).mockResolvedValue(null);

  await expect(
    pollService.editPoll("poll-000", {} as any, "user-abc", "USER")
  ).rejects.toThrow(NotFoundError);
});

it("should throw ForbiddenError if user is not the author or admin", async () => {
  (pollRepo.findPollForEdit as jest.Mock).mockResolvedValue({
    id: "poll-001",
    userId: "other-user",
    startDate: new Date(Date.now() + 10000),
  });

  await expect(
    pollService.editPoll("poll-001", {} as any, "user-abc", "USER")
  ).rejects.toThrow(ForbiddenError);
});

it("should throw ForbiddenError if poll already started", async () => {
  (pollRepo.findPollForEdit as jest.Mock).mockResolvedValue({
    id: "poll-002",
    userId: "user-abc",
    startDate: new Date(Date.now() - 10000), // 시작된 후
  });

  await expect(
    pollService.editPoll("poll-002", {} as any, "user-abc", "USER")
  ).rejects.toThrow(ForbiddenError);
});

// 투표 삭제 테스트
it("should delete the poll and its event if user is owner and poll has not started", async () => {
  const futureDate = new Date(Date.now() + 60_000); // 1분 후

  (pollRepo.findPollWithAuthor as jest.Mock).mockResolvedValue({
    id: "poll-100",
    userId: "user-abc",
    startDate: futureDate,
    eventId: "event-100",
    user: { name: "작성자" },
  });

  (pollRepo.deletePollById as jest.Mock).mockResolvedValue(undefined);
  (pollRepo.deleteEventById as jest.Mock).mockResolvedValue(undefined);

  await expect(
    pollService.removePoll("poll-100", "user-abc", "USER")
  ).resolves.toBeUndefined();

  expect(pollRepo.deletePollById).toHaveBeenCalledWith("poll-100");
  expect(pollRepo.deleteEventById).toHaveBeenCalledWith("event-100");
});

it("should throw NotFoundError if poll does not exist", async () => {
  (pollRepo.findPollWithAuthor as jest.Mock).mockResolvedValue(null);

  await expect(
    pollService.removePoll("poll-404", "user-abc", "USER")
  ).rejects.toThrow(NotFoundError);
});
