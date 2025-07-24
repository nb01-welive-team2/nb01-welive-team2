import request from "supertest";
import app from "@/app";
import { seedDatabase } from "../../prisma/seed";
import { mockUsers, mockPollOptions as mockOptions } from "../../prisma/mock";
import TestAgent from "supertest/lib/agent";

let agent: ReturnType<typeof authAgent>;

beforeEach(async () => {
  await seedDatabase();
});

function authAgent(agent: TestAgent, token: string) {
  return {
    post: (url: string) =>
      agent.post(url).set("Authorization", `Bearer ${token}`),
    delete: (url: string) =>
      agent.delete(url).set("Authorization", `Bearer ${token}`),
  };
}

describe("Option Vote API Integration Test", () => {
  beforeAll(async () => {
    const rawAgent = request.agent(app);
    const login = await rawAgent
      .post("/api/auth/login")
      .send({ username: mockUsers[0].username, password: "alicepassword" });

    agent = authAgent(rawAgent, login.body.accessToken);
  });

  describe("POST /api/options/:optionId/vote", () => {
    it("투표 생성 성공", async () => {
      await agent.delete(`/api/options/${mockOptions[0].id}/vote`);
      const res = await agent.post(`/api/options/${mockOptions[0].id}/vote`);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message", "Vote created successfully");
    });

    it("존재하지 않는 optionId 투표 시 404 반환", async () => {
      const fakeId = "8f09eabc-1234-4abc-bdef-000000000000"; // UUID
      const res = await agent.post(`/api/options/${fakeId}/vote`);

      expect(res.status).toBe(404);
    });

    it("비로그인 사용자는 401 반환", async () => {
      const res = await request(app).post(
        `/api/options/${mockOptions[0].id}/vote`
      );

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/options/:optionId/vote", () => {
    it("투표 삭제 성공", async () => {
      const res = await agent.delete(`/api/options/${mockOptions[0].id}/vote`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Vote removed successfully");
    });

    it("없는 optionId 삭제 시 404 반환", async () => {
      const fakeId = "8f09eabc-1234-4abc-bdef-000000000000";
      const res = await agent.delete(`/api/options/${fakeId}/vote`);

      expect(res.status).toBe(404);
    });

    it("비로그인 사용자는 삭제 불가 (401)", async () => {
      const res = await request(app).delete(
        `/api/options/${mockOptions[0].id}/vote`
      );

      expect(res.status).toBe(401);
    });
  });
});
