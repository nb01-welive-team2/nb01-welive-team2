import {
  createPoll,
  getPollList,
  getPoll,
  editPoll,
  removePoll,
} from "@/controllers/pollController";
import * as pollService from "@/services/pollService";
import UnauthError from "@/errors/UnauthError";
import ForbiddenError from "@/errors/ForbiddenError";

jest.mock("@/services/pollService");

// 투표 등록
describe("pollController.createPoll", () => {
  const validBody = {
    title: "테스트 투표",
    description: "설명",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    options: ["찬성", "반대"],
    buildingPermission: 0,
    articleId: "article-uuid",
    apartmentId: "apt-uuid",
  };

  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it("관리자일 경우 정상 생성", async () => {
    const req: any = {
      body: validBody,
      user: { userId: "admin-id", role: "ADMIN" },
    };
    const res = mockRes();

    const mockResult = {
      ...validBody,
      id: "poll-id",
      author: "관리자",
      status: "IN_PROGRESS",
    };
    (pollService.createPoll as jest.Mock).mockResolvedValue(mockResult);

    await createPoll(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it("로그인하지 않은 경우 UnauthError", async () => {
    const req: any = { body: validBody };
    const res = mockRes();

    await expect(createPoll(req, res)).rejects.toThrow(UnauthError);
  });

  it("일반 사용자 접근 시 AccessDeniedError", async () => {
    const req: any = {
      body: validBody,
      user: { userId: "user-id", role: "USER" },
    };
    const res = mockRes();

    await expect(createPoll(req, res)).rejects.toThrow(ForbiddenError);
  });
});

// 투표 전체조회
describe("pollController.getPollList", () => {
  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it("기본 조회 요청 처리", async () => {
    const req: any = {
      query: {},
      user: { userId: "user-id" },
    };
    const res = mockRes();

    const mockList = [{ id: "poll-1", title: "투표1" }];
    (pollService.getPollList as jest.Mock).mockResolvedValue(mockList);

    await getPollList(req, res);

    expect(pollService.getPollList).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      keyword: undefined,
      status: undefined,
      userId: "user-id",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockList);
  });

  it("쿼리 파라미터 존재할 때 처리", async () => {
    const req: any = {
      query: { page: "2", limit: "5", keyword: "주민", status: "IN_PROGRESS" },
      user: { userId: "admin-id" },
    };
    const res = mockRes();

    (pollService.getPollList as jest.Mock).mockResolvedValue([]);

    await getPollList(req, res);

    expect(pollService.getPollList).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      keyword: "주민",
      status: "IN_PROGRESS",
      userId: "admin-id",
    });
  });
});

// 투표 상세조회
describe("pollController.getPoll", () => {
  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it("투표 상세 데이터 반환 성공", async () => {
    const req: any = {
      params: { pollId: "poll-123" },
      user: { userId: "user-abc" },
    };
    const res = mockRes();

    const mockDetail = {
      id: "poll-123",
      title: "투표 제목",
      description: "설명",
      options: ["찬성", "반대"],
    };

    (pollService.getPoll as jest.Mock).mockResolvedValue(mockDetail);

    await getPoll(req, res);

    expect(pollService.getPoll).toHaveBeenCalledWith("poll-123", "user-abc");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockDetail);
  });
});

// 투표 수정
describe("pollController.editPoll", () => {
  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockBody = {
    title: "수정된 제목",
    description: "수정된 내용",
    startDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    options: ["찬성", "반대"],
    buildingPermission: 0,
    status: "PENDING",
    articleId: "article-id",
    apartmentId: "apt-id",
  };

  it("관리자 권한으로 수정 성공", async () => {
    const req: any = {
      params: { pollId: "poll-123" },
      body: mockBody,
      user: { userId: "admin-id", role: "ADMIN" },
    };
    const res = mockRes();

    const mockResult = {
      id: "poll-123",
      title: "수정된 제목",
      description: "수정된 내용",
    };

    (pollService.editPoll as jest.Mock).mockResolvedValue(mockResult);

    await editPoll(req, res);

    expect(pollService.editPoll).toHaveBeenCalledWith(
      "poll-123",
      mockBody,
      "admin-id",
      "ADMIN"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it("비로그인 사용자 UnauthError 발생", async () => {
    const req: any = {
      params: { pollId: "poll-123" },
      body: mockBody,
    };
    const res = mockRes();

    await expect(editPoll(req, res)).rejects.toThrow(UnauthError);
  });
});

// 투표 삭제
describe("pollController.removePoll", () => {
  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  it("유효한 요청일 경우 삭제 성공", async () => {
    const req: any = {
      params: { pollId: "poll-789" },
      user: { userId: "user-id", role: "USER" },
    };
    const res = mockRes();

    (pollService.removePoll as jest.Mock).mockResolvedValue(undefined);

    await removePoll(req, res);

    expect(pollService.removePoll).toHaveBeenCalledWith(
      "poll-789",
      "user-id",
      "USER"
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("비로그인 UnauthError 발생", async () => {
    const req: any = {
      params: { pollId: "poll-789" },
      user: undefined,
    };
    const res = mockRes();

    await expect(removePoll(req, res)).rejects.toThrow(UnauthError);
  });
});
