import request from "supertest";
import app from "@/app";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "../../prisma/seed";
import { mockUsers, mockNotices, mockPolls } from "../../prisma/mock";
import SuperAgentTest from "supertest/lib/agent";
import { v4 as uuid } from "uuid";

let agent: ReturnType<typeof authAgent>;
let createdEventId_NOTICE: string;
let createdEventId_POLL: string;
let apartmentId: string;

function authAgent(agent: SuperAgentTest, token: string) {
  return {
    get: (url: string) =>
      agent.get(url).set("Authorization", `Bearer ${token}`),
    put: (url: string) =>
      agent.put(url).set("Authorization", `Bearer ${token}`),
    delete: (url: string) =>
      agent.delete(url).set("Authorization", `Bearer ${token}`),
  };
}

beforeEach(async () => {
  await seedDatabase();
});

describe("Event API Integration Test", () => {
  beforeAll(async () => {
    const rawAgent = request.agent(app);
    const login = await rawAgent.post("/api/auth/login").send({
      username: mockUsers[1].username,
      password: "bobpassword",
    });

    agent = authAgent(rawAgent, login.body.accessToken);

    // apartmentId 조회
    const dbUser = await prisma.users.findUnique({
      where: { id: "0f9e7654-dfbb-46df-b93c-cc491ff9f5bd" },
      include: {
        apartmentInfo: true,
      },
    });

    if (!dbUser?.apartmentInfo?.id) {
      throw new Error("apartmentId not found for mockUsers[1]");
    }

    apartmentId = dbUser.apartmentInfo.id;
  });

  describe("NOTICE 게시글 이벤트", () => {
    it("이벤트 생성 성공 (NOTICE)", async () => {
      const res = await agent.put("/api/event").query({
        boardType: "NOTICE",
        boardId: mockNotices[0].id,
        startDate: "2025-06-01T09:00:00.000Z",
        endDate: "2025-06-01T11:00:00.000Z",
      });

      expect(res.status).toBe(200);
      createdEventId_NOTICE = res.body.id;
    });

    it("이벤트 삭제 성공 (NOTICE)", async () => {
      const res = await agent.delete(
        `/api/event/a7e21d2d-0b49-4e9a-97cb-66df3e3bfb74`
      );
      expect(res.status).toBe(200);
    });
  });

  describe("POLL 게시글 이벤트", () => {
    it("이벤트 생성 성공 (POLL)", async () => {
      const res = await agent.put("/api/event").query({
        boardType: "POLL",
        boardId: mockPolls[0].id,
        startDate: "2025-07-01T14:00:00.000Z",
        endDate: "2025-07-01T16:00:00.000Z",
      });

      expect(res.status).toBe(200);
      createdEventId_POLL = res.body.id;
    });

    it("이벤트 삭제 성공 (POLL)", async () => {
      const res = await agent.delete(
        `/api/event/3f8d3f9e-5b6a-4c4e-8a3b-1c7a7e5e7c2f`
      );
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/event", () => {
    it("이벤트 목록 조회 성공", async () => {
      const res = await agent.get("/api/event").query({
        apartmentId,
        year: 2025,
        month: 6,
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("쿼리 누락 시 400 반환", async () => {
      const res = await agent.get("/api/event").query({
        year: 2025,
        month: 6,
        // apartmentId 누락됐을 때 400 보내는지 확인
      });

      expect(res.status).toBe(400);
    });
  });

  describe("이벤트 삭제 실패 케이스", () => {
    it("없는 ID 삭제 시 404 반환", async () => {
      const res = await agent.delete(`/api/event/${uuid()}`);
      expect(res.status).toBe(404);
    });
  });
});
