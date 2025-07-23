import request from "supertest";
import app from "@/app";
import { seedDatabase } from "../../prisma/seed";
import { mockUsers, mockComplaintComments } from "../../prisma/mock";
import TestAgent from "supertest/lib/agent";

let agent: ReturnType<typeof authAgent>;

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

describe("Comment API Integration Test", () => {
  beforeAll(async () => {
    const rawAgent = request.agent(app);
    const login = await rawAgent
      .post("/api/auth/login")
      .send({ username: mockUsers[0].username, password: "alicepassword" });

    agent = authAgent(rawAgent, login.body.accessToken);
  });

  // 댓글 생성
  describe("POST /api/comments", () => {
    it("댓글 생성 성공", async () => {
      const res = await agent.post("/api/comments").send({
        postId: mockComplaintComments[0].complaintId,
        boardType: "COMPLAINT",
        content: "새 댓글입니다",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message");
    });

    it("필수 필드 누락 시 400 반환", async () => {
      const res = await agent.post("/api/comments").send({
        postId: mockComplaintComments[0].id,
      });

      expect(res.status).toBe(400);
    });

    it("비로그인 사용자는 401 반환", async () => {
      const res = await request(app).post("/api/comments").send({
        postId: mockComplaintComments[0].id,
        boardType: "COMPLAINT",
        content: "비로그인 댓글",
      });

      expect(res.status).toBe(401);
    });
  });

  // 댓글 수정
  describe("PUT /api/comments/:commentId", () => {
    it("댓글 수정 성공", async () => {
      const res = await agent
        .put(`/api/comments/${mockComplaintComments[0].id}`)
        .send({
          postId: mockComplaintComments[0].complaintId,
          boardType: "COMPLAINT",
          content: "수정된 댓글",
        });

      expect(res.status).toBe(200);
    });

    it("없는 댓글 ID 수정 시 404 반환", async () => {
      const fakeId = "8f09eabc-1234-4abc-bdef-000000000000";
      const res = await agent.put(`/api/comments/${fakeId}`).send({
        postId: mockComplaintComments[0].complaintId,
        content: "수정 불가",
        boardType: "COMPLAINT",
      });

      expect(res.status).toBe(404);
    });

    it("본인 소유가 아닌 댓글 수정 시 403 반환", async () => {
      // mockUsers[1]로 로그인 시도
      const rawAgent = request.agent(app);
      const login = await rawAgent
        .post("/api/auth/login")
        .send({ username: mockUsers[1].username, password: "bobpassword" });

      const otherUserAgent = authAgent(rawAgent, login.body.accessToken);

      const res = await otherUserAgent
        .put(`/api/comments/${mockComplaintComments[0].id}`)
        .send({
          content: "권한 없음",
          postId: mockComplaintComments[0].complaintId,
          boardType: "COMPLAINT",
        });

      expect(res.status).toBe(403);
    });
  });

  // 댓글 삭제
  describe("DELETE /api/comments/:commentId", () => {
    it("댓글 삭제 성공", async () => {
      const res = await agent.delete(
        `/api/comments/${mockComplaintComments[0].id}`
      );
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });

    it("없는 댓글 ID 삭제 시 404 반환", async () => {
      const fakeId = "8f09eabc-1234-4abc-bdef-000000000000";
      const res = await agent.delete(`/api/comments/${fakeId}`);
      expect(res.status).toBe(404);
    });

    it("본인 소유가 아닌 댓글 삭제 시 403 반환", async () => {
      // 다른 유저 로그인
      const rawAgent = request.agent(app);
      const login = await rawAgent
        .post("/api/auth/login")
        .send({ username: mockUsers[1].username, password: "bobpassword" });

      const otherUserAgent = authAgent(rawAgent, login.body.accessToken);

      const res = await otherUserAgent.delete(
        `/api/comments/${mockComplaintComments[0].id}`
      );
      expect(res.status).toBe(403);
    });

    it("비로그인 사용자는 삭제 불가 (401)", async () => {
      const res = await request(app).delete(
        `/api/comments/${mockComplaintComments[0].id}`
      );
      expect(res.status).toBe(401);
    });
  });
});
