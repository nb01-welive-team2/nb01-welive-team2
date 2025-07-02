import request from "supertest";
import app from "@/app";
import { NOTICE_CATEGORY } from "@prisma/client";
import { seedDatabase } from "../../prisma/seed";
import { mockUsers, mockNotices } from "../../prisma/mock";
import TestAgent from "supertest/lib/agent";

let agent: ReturnType<typeof authAgent>;

// DB 초기화
beforeEach(async () => {
  await seedDatabase();
});

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

describe("Notice API Integration Test", () => {
  beforeAll(async () => {
    const rawAgent = request.agent(app);
    const login = await rawAgent
      .post("/api/auth/login")
      .send({ username: mockUsers[1].username, password: "bobpassword" });

    agent = authAgent(rawAgent, login.body.accessToken);
  });

  // 등록 test
  describe("POST /api/notices", () => {
    it("공지 생성 성공", async () => {
      const res = await agent.post("/api/notices").send({
        title: "새 공지입니다",
        content: "내용입니다",
        category: NOTICE_CATEGORY.EMERGENCY,
        isPinned: false,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message");
    });

    it("필수 필드 누락 시 400 반환", async () => {
      const res = await agent
        .post("/api/notices")
        .send({ title: "불완전 데이터" });
      expect(res.status).toBe(400);
    });

    it("비로그인 사용자는 401 반환", async () => {
      const res = await request(app).post("/api/notices").send({
        title: "공지",
        content: "내용",
        category: NOTICE_CATEGORY.ETC,
      });

      expect(res.status).toBe(401);
    });
  });

  // 조회 test
  describe("GET /api/notices", () => {
    it("공지 목록 조회 성공", async () => {
      const res = await agent.get("/api/notices").query({ page: 1 });
      expect(res.status).toBe(200);
      expect(res.body.notices).toBeInstanceOf(Array);
      expect(typeof res.body.totalCount).toBe("number");
    });
  });

  describe("GET /api/notices/:id", () => {
    it("공지 상세 조회 성공", async () => {
      const res = await agent.get(`/api/notices/${mockNotices[0].id}`);
      expect(res.status).toBe(200);
      expect(res.body.title).toBe(mockNotices[0].title);
    });

    it("존재하지 않는 공지 ID는 404 반환", async () => {
      const res = await agent.get(
        "/api/notices/e7d48b31-2718-46be-b8b8-c5d25bb82d43"
      );
      expect(res.status).toBe(404);
    });
  });

  // 수정 test
  describe("PUT /api/notices/:id", () => {
    it("공지 수정 성공", async () => {
      const res = await agent.put(`/api/notices/${mockNotices[0].id}`).send({
        title: "수정된 제목",
        content: "수정된 내용",
        category: NOTICE_CATEGORY.MAINTENANCE,
        isPinned: true,
      });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("수정된 제목");
    });

    it("없는 공지 ID 수정 시 404 반환", async () => {
      const fakeId = "8f09eabc-1234-4abc-bdef-000000000000"; // uuid
      const res = await agent.put(`/api/notices/${fakeId}`).send({
        title: "수정 불가",
        content: "내용",
        category: NOTICE_CATEGORY.ETC,
        isPinned: false,
      });

      expect(res.status).toBe(404);
    });
  });

  // 삭제 test
  describe("DELETE /api/notices/:id", () => {
    it("공지 삭제 성공", async () => {
      const res = await agent.delete(`/api/notices/${mockNotices[0].id}`);
      expect(res.status).toBe(200);
    });

    it("없는 공지 ID 삭제 시 404 반환", async () => {
      const fakeId = "8f09eabc-1234-4abc-bdef-000000000000"; // uuid
      const res = await agent.delete(`/api/notices/${fakeId}`);
      expect(res.status).toBe(404);
    });

    it("비로그인 사용자는 삭제 불가 (401)", async () => {
      const res = await request(app).delete(
        `/api/notices/${mockNotices[0].id}`
      );
      expect(res.status).toBe(401);
    });
  });
});
