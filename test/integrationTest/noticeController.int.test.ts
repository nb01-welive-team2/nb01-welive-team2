import request from "supertest";
import path from "path";
import app from "@/app";
import { prisma } from "@/lib/prisma";
import { NOTICE_CATEGORY } from "@prisma/client";

const seedPath = path.resolve(__dirname, "../../prisma/seed");
const { seedDatabase } = require(seedPath);

const mockPath = path.resolve(__dirname, "../../prisma/mock");
const { mockUsers } = require(mockPath);

import TestAgent from "supertest/lib/agent";

beforeEach(async () => {
  await seedDatabase();
});

describe("Notice Integration Tests", () => {
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

  beforeEach(async () => {
    await seedDatabase();

    const rawAgent = request.agent(app);
    const loginRes = await rawAgent.post("/api/auth/login").send({
      username: mockUsers[1].username,
      password: "bobpassword",
    });

    const token = loginRes.body.accessToken;
    agent = authAgent(rawAgent, token);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("POST /api/notices", async () => {
    const res = await agent.post("/api/notices").send({
      title: "공지 제목",
      content: "공지 내용",
      isPinned: true,
      category: NOTICE_CATEGORY.MAINTENANCE,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message");
  });

  it("GET /api/notices", async () => {
    const res = await agent.get("/api/notices").query({ page: 1 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalCount");
    expect(res.body).toHaveProperty("notices");
  });

  it("GET /api/notices/:id", async () => {
    const notice = await prisma.notices.findFirstOrThrow();

    const res = await agent.get(`/api/notices/${notice.id}`);
    expect(res.status).toBe(200);
    expect(res.body.noticeId).toBe(notice.id);
  });

  it("DELETE /api/notices/:id", async () => {
    const notice = await prisma.notices.findFirstOrThrow();

    const res = await agent.delete(`/api/notices/${notice.id}`);
    expect(res.status).toBe(200);

    const found = await prisma.notices.findUnique({ where: { id: notice.id } });
    expect(found).toBeNull();
  });
});
