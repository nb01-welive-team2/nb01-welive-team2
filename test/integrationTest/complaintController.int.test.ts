import request from "supertest";
import app from "@/app";
import path from "path";
const seedPath = path.resolve(__dirname, "../../prisma/seed");
const { seedDatabase } = require(seedPath);
const mockPath = path.resolve(__dirname, "../../prisma/mock");
const { mockUsers, mockComplaints } = require(mockPath);

beforeEach(async () => {
  await seedDatabase();
});

describe("ComplaintController Integration Tests", () => {
  const userAgent = request.agent(app);
  const adminAgent = request.agent(app);
  const superAdminAgent = request.agent(app);

  beforeAll(async () => {
    // USER 로그인
    const resUser = await userAgent.post("/api/auth/login").send({
      username: mockUsers[0].username, // USER
      password: "alicepassword",
    });

    // ADMIN 로그인
    await adminAgent.post("/api/auth/login").send({
      username: mockUsers[1].username, // ADMIN
      password: "bobpassword",
    });

    // SUPER_ADMIN 로그인
    await superAdminAgent.post("/api/auth/login").send({
      username: mockUsers[2].username, // SUPER_ADMIN
      password: "superpassword",
    });
  });

  describe("POST /api/complaints", () => {
    it("should create complaint with 201 for USER role", async () => {
      const body = {
        title: "불편사항 제목",
        content: "불편사항 내용",
        isPublic: true,
      };
      const res = await userAgent.post("/api/complaints").send(body);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 403 if role is not USER", async () => {
      const body = {
        title: "불편사항 제목",
        content: "내용",
        isPublic: true,
      };
      const res = await superAdminAgent.post("/api/complaints").send(body);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("GET /api/complaints", () => {
    it("should return complaint list for non-SUPER_ADMIN", async () => {
      const res = await userAgent
        .get("/api/complaints")
        .query({ page: 1, limit: 10 });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("complaints");
      expect(Array.isArray(res.body.complaints)).toBe(true);
    });

    it("should return 403 for SUPER_ADMIN role", async () => {
      const res = await superAdminAgent
        .get("/api/complaints")
        .query({ page: 1, limit: 10 });
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("GET /api/complaints/:complaintId", () => {
    const validComplaintId = mockComplaints[0].id;

    it("should return complaint detail for non-SUPER_ADMIN", async () => {
      const res = await userAgent.get(`/api/complaints/${validComplaintId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", validComplaintId);
      expect(res.body).toHaveProperty("user");
    });

    it("should return 403 for SUPER_ADMIN", async () => {
      const res = await superAdminAgent.get(
        `/api/complaints/${validComplaintId}`
      );
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 404 if complaint not found", async () => {
      const res = await userAgent.get(`/api/complaints/non-existent-id`);
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/complaints/:complaintId", () => {
    const validComplaintId = mockComplaints[0].id;
    const validBody = {
      title: "수정된 제목",
      content: "수정된 내용",
      isPublic: false,
    };

    it("should update complaint for USER role", async () => {
      const res = await userAgent
        .put(`/api/complaints/${validComplaintId}`)
        .send(validBody);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("title", validBody.title);
    });

    it("should return 403 if role not USER", async () => {
      const res = await superAdminAgent
        .put(`/api/complaints/${validComplaintId}`)
        .send(validBody);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 404 if complaint not found", async () => {
      const res = await userAgent
        .put(`/api/complaints/non-existent-id`)
        .send(validBody);
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/complaints/:complaintId", () => {
    it("should delete complaint for ADMIN role", async () => {
      const complaintId = mockComplaints[0].id;
      const res = await adminAgent.delete(`/api/complaints/${complaintId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 403 if role not ADMIN", async () => {
      const complaintId = mockComplaints[0].id;
      const res = await userAgent.delete(`/api/complaints/${complaintId}`);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 404 if complaint not found", async () => {
      const res = await adminAgent.delete(`/api/complaints/non-existent-id`);
      expect(res.status).toBe(404);
    });
  });
});
