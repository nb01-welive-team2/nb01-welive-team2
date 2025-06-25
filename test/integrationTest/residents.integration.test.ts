import { prisma } from "../../src/lib/prisma";
import request from "supertest";
import app from "../../src/app";
import path from "path";
const seedPath = path.resolve(__dirname, "../../prisma/seed");
const { seedDatabase } = require(seedPath);

beforeEach(async () => {
  await seedDatabase();
});

describe("입주민 API 통합 테스트", () => {
  let residentId: any;
  let apartmentId: any;
  let agent: any;

  beforeEach(async () => {
    agent = request.agent(app);
    await prisma.residents.deleteMany();
    await prisma.apartmentInfo.deleteMany();
    await prisma.users.deleteMany();

    const testUser = await prisma.users.create({
      data: {
        username: "adminUser",
        encryptedPassword:
          "$2a$10$pJffFvTAHtCQzjOh4YRKF.qwIqSCCcPLLawMhjJSwaHWxtUytjqwa", // bobpassword
        contact: "010-1234-5678",
        name: "관리자",
        email: "admin@example.com",
        role: "ADMIN",
        joinStatus: "APPROVED",
      },
    });

    const testApartment = await prisma.apartmentInfo.create({
      data: {
        userId: testUser.id,
        approvalStatus: "APPROVED",
        apartmentName: "테스트아파트",
        apartmentAddress: "서울시 테스트구 테스트동",
        apartmentManagementNumber: "MGMT-1234",
        description: "테스트용 아파트입니다.",
        startComplexNumber: 1,
        endComplexNumber: 3,
        startDongNumber: 101,
        endDongNumber: 105,
        startFloorNumber: 1,
        endFloorNumber: 15,
        startHoNumber: 101,
        endHoNumber: 1204,
      },
    });

    apartmentId = testApartment.id;

    const testResident = await prisma.residents.create({
      data: {
        apartmentId: apartmentId,
        building: 102,
        unitNumber: 1104,
        contact: "010-1234-5678",
        name: "김입주",
        email: "resident@example.com",
        residenceStatus: "RESIDENCE",
        isHouseholder: "HOUSEHOLDER",
        isRegistered: true,
        approvalStatus: "APPROVED",
      },
    });

    residentId = testResident.id;

    await agent
      .post("/api/auth/login")
      .send({ username: "adminUser", password: "bobpassword" })
      .expect(200);
  });

  afterAll(async () => {
    await prisma.residents.deleteMany();
    await prisma.apartmentInfo.deleteMany();
    await prisma.users.deleteMany();
    await prisma.$disconnect();
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
      const response = await agent
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
        apartmentId,
        residenceStatus: "RESIDENCE",
        isRegistered: false,
        approvalStatus: "PENDING",
      });
    });
  });

  describe("GET /api/residents", () => {
    test("입주민 목록 조회", async () => {
      const response = await agent.get("/api/residents");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /residents/${residentId}", () => {
    test("입주민 상세 조회", async () => {
      const response = await agent.get(`/api/residents/${residentId}`);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: residentId,
      });
    });
  });

  describe("PATCH /api/residents/:id", () => {
    test("입주민 정보 수정", async () => {
      const updateData = {
        name: "코드잇",
      };
      const response = await agent
        .patch(`/api/residents/${residentId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ...updateData,
        id: residentId,
      });
    });
  });

  describe("DELETE /api/residents/:id", () => {
    test("입주민 삭제", async () => {
      const response = await agent.delete(`/api/residents/${residentId}`);
      expect(response.status).toBe(200);
    });
  });

  describe("GET /api/residents/download", () => {
    test("입주민 명부 다운로드", async () => {
      const res = await agent
        .get("/api/residents/download")
        .expect("Content-Type", "text/csv; charset=utf-8")
        .expect("Content-Disposition", /attachment; filename=.*\.csv/)
        .expect(200);

      expect(res.text).toContain(
        '"name","building","unitNumber","contact","email","isHouseholder"'
      );
    });
  });

  describe("GET /api/residents/template", () => {
    test("입주민 명부 양식 다운로드", async () => {
      const res = await agent
        .get("/api/residents/template")
        .expect(200)
        .expect("Content-Type", "text/csv; charset=utf-8");

      expect(res.text).toContain(
        '"name","building","unitNumber","contact","email","isHouseholder"'
      );
    });
  });

  describe("POST /api/upload", () => {
    test("입주민 명부 파일 업로드", async () => {
      const filePath = path.join(__dirname, "fixtures", "test-residents.csv");

      const res = await agent
        .post("/api/residents/upload")
        .attach("file", filePath)
        .expect(201);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
  test("잘못된 CSV 형식 업로드 시 400 응답", async () => {
    const filePath = path.join(__dirname, "fixtures", "error-residents.csv");
    const res = await agent
      .post("/api/residents/upload")
      .attach("file", filePath)
      .expect(400);

    expect(res.body.message).toContain("형식 오류");
  });
});
