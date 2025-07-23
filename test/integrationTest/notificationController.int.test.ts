import request from "supertest";
import app from "@/app";
import { seedDatabase } from "../../prisma/seed";
import { mockUsers, mockNotifications } from "../../prisma/mock";
import TestAgent from "supertest/lib/agent";

let agent: ReturnType<typeof authAgent>;
let token: string;
beforeEach(async () => {
  await seedDatabase();
});

function authAgent(agent: TestAgent, token: string) {
  return {
    get: (url: string) =>
      agent.get(url).set("Authorization", `Bearer ${token}`),
    patch: (url: string) =>
      agent.patch(url).set("Authorization", `Bearer ${token}`),
    post: (url: string) =>
      agent.post(url).set("Authorization", `Bearer ${token}`),
  };
}

describe("Notification API Integration Test", () => {
  beforeAll(async () => {
    const rawAgent = request.agent(app);
    const login = await rawAgent
      .post("/api/auth/login")
      .send({ username: mockUsers[0].username, password: "alicepassword" });
    token = login.body.accessToken;
    agent = authAgent(rawAgent, login.body.accessToken);
  });

  /**
   * SSE 알림 수신 테스트
   */
  describe("GET /api/notifications/sse", () => {
    it("SSE 연결 성공", async () => {
      const res = await agent.get("/api/notifications/sse").query({ token });
      console.log("res header", res.headers);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/event-stream");
    });
  });

  /**
   * 개별 알림 읽음 처리
   */
  describe("PATCH /api/notifications/:notificationId/read", () => {
    it("알림 읽음 처리 성공", async () => {
      const notificationId = mockNotifications[0].id;

      const res = await agent
        .patch(`/api/notifications/${notificationId}/read`)
        .send({ isRead: true });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("알림 상태가 업데이트되었습니다");
    });

    it("잘못된 ID 요청 시 400", async () => {
      const res = await agent
        .patch("/api/notifications/invalid-id/read")
        .send({ isRead: true });

      expect(res.status).toBe(400);
    });
  });

  /**
   * 읽지 않은 알림 개수 조회
   */
  describe("GET /api/notifications/me/unread-count", () => {
    it("읽지 않은 알림 개수 반환", async () => {
      const res = await agent.get("/api/notifications/me/unread-count");
      expect(res.status).toBe(200);
      expect(typeof res.body.data.count).toBe("number");
    });
  });

  /**
   * 모든 알림 읽음 처리
   */
  describe("POST /api/notifications/mark-all-read", () => {
    it("모든 알림 읽음 처리 성공", async () => {
      const res = await agent.post("/api/notifications/mark-all-read");
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("모든 알림이 읽음 처리되었습니다");
    });
  });
});
