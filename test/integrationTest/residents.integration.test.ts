import { prisma } from "../../src/lib/prisma";
import request from "supertest";
import app from "../../src/app";
import path from "path";

const seedPath = path.resolve(__dirname, "../../prisma/seed");
const { seedDatabase } = require(seedPath);

const mockPath = path.resolve(__dirname, "../../prisma/mock");
const { mockUsers } = require(mockPath);

beforeEach(async () => {
  await seedDatabase();
});

describe("입주민 API 통합 테스트", () => {
  const adminAgent = request.agent(app);
  const superAdminAgent = request.agent(app);
  const userAgent = request.agent(app);

  beforeAll(async () => {
    // 로그인: 유저, 관리자, 슈퍼관리자
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

  // --- 단건 등록 (uploadResidentController) ---
  describe("POST /api/residents/register", () => {
    test("관리자 단건 입주민 등록 성공", async () => {
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
      expect(response.body).toMatchObject(
        expect.objectContaining({
          name: "테스트유저",
          building: 108,
          unitNumber: 1503,
          contact: "01098765432",
          email: "testuser@example.com",
          isHouseholder: "HOUSEHOLDER",
        })
      );
    });
  });

  // --- 입주민 목록 조회 (getResidentsListFilteredController) ---
  describe("GET /api/residents", () => {
    test("관리자 입주민 목록 조회 성공", async () => {
      const response = await adminAgent.get("/api/residents");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.residents)).toBe(true);
      expect(response.body.residents.length).toBeGreaterThan(0);
      expect(response.body.message).toMatch(
        /조회된 입주민 결과가 \d+건 입니다./
      );
    });

    test("필터 쿼리 적용하여 입주민 목록 조회", async () => {
      const response = await adminAgent
        .get("/api/residents")
        .query({ name: "테스트" });

      expect(response.status).toBe(200);
      expect(response.body.residents).toBeDefined();
      expect(response.body.message).toMatch(
        /조회된 입주민 결과가 \d+건 입니다./
      );
    });
  });

  // --- 입주민 상세 조회 (getResidentByIdController) ---
  describe("GET /api/residents/:id", () => {
    test("관리자 입주민 상세 조회 성공", async () => {
      const residentId = "69f298ce-5775-4206-b377-d083313e4946";
      const response = await adminAgent.get(`/api/residents/${residentId}`);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ id: residentId });
    });
  });

  // --- 입주민 정보 수정 (updateResidentInfoController) ---
  describe("PATCH /api/residents/:id", () => {
    test("관리자 입주민 정보 수정 성공", async () => {
      const residentId = "69f298ce-5775-4206-b377-d083313e4946";
      const updateData = {
        name: "코드잇",
      };
      const response = await adminAgent
        .patch(`/api/residents/${residentId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: residentId,
        name: "코드잇",
      });
    });
  });

  // --- 입주민 삭제 (deleteResidentController) ---
  describe("DELETE /api/residents/:id", () => {
    test("관리자 입주민 삭제 성공", async () => {
      const residentId = "69f298ce-5775-4206-b377-d083313e4946";
      const response = await adminAgent.delete(`/api/residents/${residentId}`);
      expect(response.status).toBe(200);
    });
  });

  // --- 입주민 명부 양식 다운로드 (downloadResidentsCsvTemplateController) ---
  describe("GET /api/residents/template", () => {
    test("입주민 명부 양식 CSV 다운로드 성공", async () => {
      const response = await adminAgent
        .get("/api/residents/template")
        .expect(200)
        .expect("Content-Type", "text/csv; charset=utf-8");

      expect(response.text).toContain(
        '"name","building","unitNumber","contact","email","isHouseholder"'
      );
    });
  });

  // --- 입주민 명부 CSV 업로드 및 다운로드 ---
  describe("입주민 명부 CSV 업로드 및 다운로드", () => {
    const validCsvPath = path.join(__dirname, "fixtures", "test-residents.csv");
    const invalidCsvPath = path.join(
      __dirname,
      "fixtures",
      "error-residents.csv"
    );

    test("정상 CSV 업로드 후 전체 명부 다운로드 성공", async () => {
      // CSV 업로드
      await adminAgent
        .post("/api/residents/upload")
        .attach("file", validCsvPath)
        .expect(201);

      // 전체 명부 다운로드
      const downloadRes = await adminAgent
        .get("/api/residents/download")
        .expect(200)
        .expect("Content-Type", "text/csv; charset=utf-8")
        .expect("Content-Disposition", /attachment; filename=.*\.csv/);

      expect(downloadRes.text).toContain(
        '"name","building","unitNumber","contact","email","isHouseholder"'
      );
    });

    test("name 쿼리 필터가 적용된 CSV 다운로드 성공", async () => {
      // CSV 업로드
      await adminAgent
        .post("/api/residents/upload")
        .attach("file", validCsvPath)
        .expect(201);

      // 필터된 명부 다운로드
      const filteredDownload = await adminAgent
        .get("/api/residents/download")
        .query({ name: "몬" })
        .expect(200)
        .expect("Content-Type", "text/csv; charset=utf-8")
        .expect("Content-Disposition", /attachment; filename=.*\.csv/);

      expect(filteredDownload.text).toContain('"포켓몬"');
      expect(filteredDownload.text).not.toContain('"자르반"');
      expect(filteredDownload.text).not.toContain('"Charlie Chaplin"');
    });

    test("잘못된 CSV 업로드 시 400 에러 반환", async () => {
      const response = await adminAgent
        .post("/api/residents/upload")
        .attach("file", invalidCsvPath)
        .expect(400);

      expect(response.body.message).toMatch(/형식 오류/);
    });

    test("CSV 업로드 시 파일이 없으면 400 에러 반환", async () => {
      const response = await adminAgent
        .post("/api/residents/upload")
        .expect(400);
      expect(response.body.message).toMatch(/CSV 파일이 없습니다/);
    });
  });
});
