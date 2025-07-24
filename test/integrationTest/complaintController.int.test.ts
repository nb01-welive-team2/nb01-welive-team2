import request from "supertest";
import app from "@/app";
import { seedDatabase } from "../../prisma/seed";
import { mockUsers, mockComplaints } from "../../prisma/mock";

beforeEach(async () => {
  await seedDatabase();
});

describe("ComplaintController Integration Tests", () => {
  const userAgent = request.agent(app);
  const adminAgent = request.agent(app);
  const superAdminAgent = request.agent(app);

  beforeAll(async () => {
    // 로그인 (권한은 실제 서비스 미들웨어에서 처리됨)
    await userAgent.post("/api/auth/login").send({
      username: mockUsers[0].username,
      password: "alicepassword",
    });
    await adminAgent.post("/api/auth/login").send({
      username: mockUsers[1].username,
      password: "bobpassword",
    });
    await superAdminAgent.post("/api/auth/login").send({
      username: mockUsers[2].username,
      password: "superpassword",
    });
  });

  describe("POST /api/complaints", () => {
    it("should create complaint and return 201", async () => {
      const body = {
        title: "불편사항 제목",
        content: "불편사항 내용",
        isPublic: true,
      };
      const res = await userAgent.post("/api/complaints").send(body);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("GET /api/complaints", () => {
    it("should return complaint list and status 200", async () => {
      const res = await userAgent
        .get("/api/complaints")
        .query({ page: 1, limit: 10 });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("complaints");
      expect(Array.isArray(res.body.complaints)).toBe(true);
    });
  });

  describe("GET /api/complaints/:complaintId", () => {
    const validComplaintId = mockComplaints[0].id;
    const invalidComplaintId = "00000000-0000-0000-0000-000000000000";

    it("should return complaint detail with 200", async () => {
      const res = await userAgent.get(`/api/complaints/${validComplaintId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("complaintId", validComplaintId);
    });

    it("should return 404 for invalid complaintId", async () => {
      const res = await userAgent.get(`/api/complaints/${invalidComplaintId}`);
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/complaints/:complaintId", () => {
    const validComplaintId = mockComplaints[0].id;
    const invalidComplaintId = "00000000-0000-0000-0000-000000000000";
    const validBody = {
      title: "수정된 제목",
      content: "수정된 내용",
      isPublic: false,
    };

    it("should update complaint and return 200", async () => {
      const res = await userAgent
        .put(`/api/complaints/${validComplaintId}`)
        .send(validBody);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("title", validBody.title);
    });

    it("should return 403 for invalid complaintId", async () => {
      const res = await userAgent
        .put(`/api/complaints/${invalidComplaintId}`)
        .send(validBody);
      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/complaints/:complaintId", () => {
    const complaintId = mockComplaints[0].id;
    const invalidComplaintId = "00000000-0000-0000-0000-000000000000";

    it("should delete complaint and return 200", async () => {
      // 여기서는 관리자 권한 여부는 서비스나 미들웨어에서 처리되므로 단순 삭제 호출만 테스트
      const res = await adminAgent.delete(`/api/complaints/${complaintId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 403 for invalid complaintId", async () => {
      const res = await adminAgent.delete(
        `/api/complaints/${invalidComplaintId}`
      );
      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/complaints/:complaintId/status", () => {
    const complaintId = mockComplaints[0].id;
    const invalidComplaintId = "00000000-0000-0000-0000-000000000000";
    const validBody = {
      status: "RESOLVED",
    };

    it("should update complaint status and return 200", async () => {
      const res = await adminAgent
        .patch(`/api/complaints/${complaintId}/status`)
        .send(validBody);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 404 for invalid complaintId", async () => {
      const res = await adminAgent
        .patch(`/api/complaints/${invalidComplaintId}/status`)
        .send(validBody);
      expect(res.status).toBe(404);
    });
  });
});
