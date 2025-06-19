import request from "supertest";
import app from "@/app";
import path from "path";
const seedPath = path.resolve(__dirname, "../../prisma/seed");
const { seedDatabase } = require(seedPath);
const mockPath = path.resolve(__dirname, "../../prisma/mock");
const { mockArticles, mockUsers, mockComments } = require(mockPath);

import TestAgent from "supertest/lib/agent";
import { mockPolls } from "../../prisma/mock";

beforeEach(async () => {
  await seedDatabase();
});

describe("PollController Logined", () => {
  let agent: {
    post: (url: string) => request.Test;
    get: (url: string) => request.Test;
    delete: (url: string) => request.Test;
    put: (url: string) => request.Test;
  };
  function authAgent(agent: TestAgent, token: string) {
    return {
      post: (url: string) =>
        agent.post(url).set("Authorization", `Bearer ${token}`),
      get: (url: string) =>
        agent.get(url).set("Authorization", `Bearer ${token}`),
      delete: (url: string) =>
        agent.delete(url).set("Authorization", `Bearer ${token}`),
      put: (url: string) =>
        agent.put(url).set("Authorization", `Bearer ${token}`),
    };
  }

  beforeAll(async () => {
    const agentWithToken = request.agent(app);
    const loginResponse = await agentWithToken
      .post("/api/auth/login")
      .send({ username: mockUsers[1].username, password: "bobpassword" });
    agent = authAgent(agentWithToken, loginResponse.body.accessToken);
  });

  describe("POST /api/polls", () => {
    it("should create poll and return 201 with message", async () => {
      const validBody = {
        boardId:
          "게시판의 고유 ID (민원, 투표, 공지 중 하나 - boardId, UUID 형식)",
        userId: "0f9e7654-dfbb-46df-b93c-cc491ff9f5bd",
        status: "PENDING",
        title: "제 3기 동대표 선출",
        content: "동대표를 선출합니다. 투표에 참여해주세요",
        buildingPermission: 0,
        startDate: "2025-06-20T00:00:00Z",
        endDate: "2025-06-30T00:00:00Z",
        options: [
          {
            title: "101호",
          },
          {
            title: "404호",
          },
          {
            title: "504호",
          },
        ],
      };
      const response = await agent.post("/api/polls").send(validBody);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message");
    });
    it("should return 400 if required fields are missing", async () => {
      const invalidBody = { title: "제목만 있음" };
      const response = await agent.post("/api/polls").send(invalidBody);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
    it("should return 401 if user is not authenticated", async () => {
      const unauthenticatedAgent = request.agent(app);
      const response = await unauthenticatedAgent
        .post("/api/polls")
        .send({ title: "제목만 있음" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Unauthorized");
    });
  });

  describe("GET /api/polls", () => {
    it("should return poll list if user's apartment", async () => {
      const response = await agent.get(`/api/polls`).query({ page: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("polls");
      expect(response.body.polls).toBeInstanceOf(Array);
    });
  });

  describe("GET /api/polls/:pollId", () => {
    it("should return poll data", async () => {
      const response = await agent.get(`/api/polls/${mockPolls[0].id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", mockPolls[0].status);
      expect(response.body).toHaveProperty("title", mockArticles[1].title);
    });

    it("should return 401 if user is not authenticated", async () => {
      const unauthenticatedAgent = request.agent(app);
      const response = await unauthenticatedAgent.get(
        `/api/polls/${mockPolls[0].id}`
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Unauthorized");
    });

    it("should return 404 if poll not found", async () => {
      const response = await agent.get(`/api/polls/999`);

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/polls/:pollId", () => {
    it("should edit poll and return 200 with updated data", async () => {
      const validBody = {
        userId: "0f9e7654-dfbb-46df-b93c-cc491ff9f5bd", //bob admin
        title: "제 2회 돌려돌려 돌림판",
        content: "관리비 몰빵 묻고 더블로 갑니다.",
        buildingPermission: 0,
        startDate: "2025-06-11T12:00:00.000Z",
        endDate: "2025-06-12T20:00:00.000Z",
        status: "PENDING",
        options: [
          {
            title: "1번 후보: 나는 아니길",
          },
        ],
      };
      const response = await agent
        .put(`/api/polls/${mockPolls[0].id}`)
        .send(validBody);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("content", validBody.content);
    });

    it("should return 400 if required fields are missing", async () => {
      const invalidBody = { title: "제목만 있음" };
      const response = await agent
        .put(`/api/polls/${mockPolls[0].id}`)
        .send(invalidBody);

      expect(response.status).toBe(400);
    });

    it("should return 401 if user is not authenticated", async () => {
      const unauthenticatedAgent = request.agent(app);
      const validBody = {
        userId: "0f9e7654-dfbb-46df-b93c-cc491ff9f5bd", //bob admin
        title: "제 2회 돌려돌려 돌림판",
        content: "관리비 몰빵 묻고 더블로 갑니다.",
        buildingPermission: 0,
        startDate: "2025-06-11T12:00:00.000Z",
        endDate: "2025-06-12T20:00:00.000Z",
        status: "PENDING",
        options: [
          {
            title: "1번 후보: 나는 아니길",
          },
        ],
      };
      const response = await unauthenticatedAgent
        .put(`/api/polls/${mockPolls[0].id}`)
        .send(validBody);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Unauthorized");
    });

    it("should return 404 if article not found", async () => {
      const validBody = {
        userId: "0f9e7654-dfbb-46df-b93c-cc491ff9f5bd", //bob admin
        title: "제 2회 돌려돌려 돌림판",
        content: "관리비 몰빵 묻고 더블로 갑니다.",
        buildingPermission: 0,
        startDate: "2025-06-11T12:00:00.000Z",
        endDate: "2025-06-12T20:00:00.000Z",
        status: "PENDING",
        options: [
          {
            title: "1번 후보: 나는 아니길",
          },
        ],
      };
      const response = await agent.put(`/api/polls/999`).send(validBody);

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/polls/:pollId", () => {
    it("should delete article and return 204", async () => {
      const response = await agent.delete(`/api/polls/${mockPolls[0].id}`);

      expect(response.status).toBe(204);
    });

    it("should return 401 if user is not authenticated", async () => {
      const unauthenticatedAgent = request.agent(app);
      const response = await unauthenticatedAgent.delete(
        `/api/polls/${mockPolls[0].id}`
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Unauthorized");
    });

    it("should return 404 if article not found", async () => {
      const response = await agent.delete(`/api/polls/999`);

      expect(response.status).toBe(404);
    });
  });
});
