import { prisma } from "../../src/lib/prisma";
import request from "supertest";
import app from "../../src/app";
import path from "path";
const seedPath = path.resolve(__dirname, "../../prisma/seed");
const { seedDatabase } = require(seedPath);
const mockPath = path.resolve(__dirname, "../../prisma/mock");
const { mockUsers, mockComplaints } = require(mockPath);

beforeEach(async () => {
  await seedDatabase();
});

describe("입주민 API 통합 테스트", () => {
  const adminAgent = request.agent(app);
  const superAdminAgent = request.agent(app);
  const userAgent = request.agent(app);

  beforeAll(async () => {
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

  describe("POST /api/residents/register", () => {
    test("입주민 개별 등록 성공", async () => {
      const newResident = {
        building: 108,
        unitNumber: 1503,
        contact: "01098765432",
        email: "testuser@example.com",
        name: "테스트유저",
        isHouseholder: "HOUSEHOLDER",
      };
      const response = await adminAgent
        .post("/api/residents/register")
        .send(newResident);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        building: 108,
        unitNumber: 1503,
        contact: "01098765432",
        email: "testuser@example.com",
        name: "테스트유저",
        isHouseholder: "HOUSEHOLDER",
        residenceStatus: "RESIDENCE",
        isRegistered: false,
        approvalStatus: "PENDING",
      });
    });

    test("관리자 외에 유저 개별 등록 403 반환", async () => {
      const newResident = {
        building: 108,
        unitNumber: 1503,
        contact: "01098765432",
        email: "testuser@example.com",
        name: "테스트유저",
        isHouseholder: "HOUSEHOLDER",
      };
      const response = await userAgent
        .post("/api/residents/register")
        .send(newResident);
      expect(response.status).toBe(403);
    });
  });

  describe("GET /api/residents", () => {
    test("입주민 목록 조회", async () => {
      const response = await adminAgent.get("/api/residents");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test("일반유저 입주민 목록 조회 403", async () => {
      const response = await userAgent.get("/api/residents");
      expect(response.status).toBe(403);
    });

    test("슈퍼관리자 입주민 목록 조회 403", async () => {
      const response = await superAdminAgent.get("/api/residents");
      expect(response.status).toBe(403);
    });
  });

  describe("GET /residents/${residentId}", () => {
    test("입주민 상세 조회", async () => {
      const response = await adminAgent.get(
        "/api/residents/69f298ce-5775-4206-b377-d083313e4946"
      );
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: "69f298ce-5775-4206-b377-d083313e4946",
      });
    });

    test("일반유저 입주민 목록 조회 403", async () => {
      const response = await userAgent.get(
        "/api/residents/69f298ce-5775-4206-b377-d083313e4946"
      );
      expect(response.status).toBe(403);
    });
    test("슈퍼관리자 입주민 목록 조회 403", async () => {
      const response = await superAdminAgent.get(
        "/api/residents/69f298ce-5775-4206-b377-d083313e4946"
      );
      expect(response.status).toBe(403);
    });
  });

  describe("PATCH /api/residents/:id", () => {
    test("관리자) 입주민 정보 수정", async () => {
      const updateData = {
        name: "코드잇",
      };
      const response = await adminAgent
        .patch(`/api/residents/69f298ce-5775-4206-b377-d083313e4946`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ...updateData,
        id: "69f298ce-5775-4206-b377-d083313e4946",
      });
    });

    test("일반유저) 입주민 정보 수정 403", async () => {
      const updateData = {
        name: "코드잇",
      };
      const response = await userAgent
        .patch(`/api/residents/69f298ce-5775-4206-b377-d083313e4946`)
        .send(updateData);

      expect(response.status).toBe(403);
    });

    test("슈퍼관리자) 입주민 정보 수정 403", async () => {
      const updateData = {
        name: "코드잇",
      };
      const response = await superAdminAgent
        .patch(`/api/residents/69f298ce-5775-4206-b377-d083313e4946`)
        .send(updateData);

      expect(response.status).toBe(403);
    });
  });

  describe("GET /api/residents/template", () => {
    test("입주민 명부 양식 다운로드", async () => {
      const res = await adminAgent
        .get("/api/residents/template")
        .expect(200)
        .expect("Content-Type", "text/csv; charset=utf-8");

      expect(res.text).toContain(
        '"name","building","unitNumber","contact","email","isHouseholder"'
      );
    });
  });

  describe("입주민 명부 업로드 및 다운로드 통합 테스트", () => {
    const validCsvPath = path.join(__dirname, "fixtures", "test-residents.csv");
    const invalidCsvPath = path.join(
      __dirname,
      "fixtures",
      "error-residents.csv"
    );

    test("GET /api/residents/upload  정상 CSV 업로드 후 전체 명부 다운로드", async () => {
      const uploadRes = await adminAgent
        .post("/api/residents/upload")
        .attach("file", validCsvPath)
        .expect(201);

      expect(Array.isArray(uploadRes.body.data)).toBe(true);
      expect(uploadRes.body.data.length).toBeGreaterThan(0);

      const downloadRes = await adminAgent
        .get("/api/residents/download")
        .expect("Content-Type", "text/csv; charset=utf-8")
        .expect("Content-Disposition", /attachment; filename=.*\.csv/)
        .expect(200);

      expect(downloadRes.text).toContain(
        '"name","building","unitNumber","contact","email","isHouseholder"'
      );
    });

    test("GET /api/residents/download 정상 CSV 업로드 후 name=몬 포함된 명부만 다운로드", async () => {
      await adminAgent
        .post("/api/residents/upload")
        .attach("file", validCsvPath)
        .expect(201);

      const filteredDownload = await adminAgent
        .get("/api/residents/download")
        .query({ name: "몬" })
        .expect("Content-Type", "text/csv; charset=utf-8")
        .expect("Content-Disposition", /attachment; filename=.*\.csv/)
        .expect(200);

      expect(filteredDownload.text).toContain('"포켓몬"');
      expect(filteredDownload.text).not.toContain('"자르반"');
      expect(filteredDownload.text).not.toContain('"Charlie Chaplin"');
    });

    test("잘못된 CSV 형식 업로드 시 400 응답", async () => {
      const res = await adminAgent
        .post("/api/residents/upload")
        .attach("file", invalidCsvPath)
        .expect(400);

      expect(res.body.message).toContain("형식 오류");
    });
  });

  describe("DELETE /api/residents/:id", () => {
    test("입주민 삭제", async () => {
      const response = await adminAgent.delete(
        "/api/residents/69f298ce-5775-4206-b377-d083313e4946"
      );
      expect(response.status).toBe(200);
    });

    test("슈퍼관리자)입주민 삭제 403", async () => {
      const response = await superAdminAgent.delete(
        "/api/residents/69f298ce-5775-4206-b377-d083313e4946"
      );
      expect(response.status).toBe(403);
    });

    test("일반유저)입주민 삭제 403", async () => {
      const response = await userAgent.delete(
        "/api/residents/69f298ce-5775-4206-b377-d083313e4946"
      );
      expect(response.status).toBe(403);
    });

    test("관리자와 입주민의 apartmentId가 다르면 403", async () => {
      const response = await adminAgent.delete(
        "/api/residents/a2381297a-5775-4206-b377-d083313e4941"
      );
      expect(response.status).toBe(403);
    });
  });
});
