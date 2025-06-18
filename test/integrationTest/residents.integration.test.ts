import { prisma } from "../../src/lib/prisma";
import request from "supertest";
import app from "../../src/app";

let testResidentId: string;

describe("입주민 API 테스트", () => {
  beforeAll(async () => {
    await prisma.residents.deleteMany({
      where: {
        OR: [
          { email: { in: ["test@gmail.com", "test11232@gmail.com"] } },
          { name: { in: ["김찬호", "테스트유저", "홍길동", "Patch전"] } },
        ],
      },
    });

    const resident = await prisma.residents.create({
      data: {
        building: 108,
        unitNumber: 1502,
        contact: "01012341234",
        email: "test@gmail.com",
        name: "김찬호",
        isHouseholder: "HOUSEHOLDER",
        residenceStatus: "RESIDENCE",
        isRegistered: true,
        approvalStatus: "APPROVED",
        apartmentId: "2149430f-2892-463f-b3e7-4e893548c6d6",
      },
    });
    testResidentId = resident.id;
  });

  afterAll(async () => {
    await prisma.residents.deleteMany({
      where: {
        OR: [
          { email: { in: ["test@gmail.com", "test11232@gmail.com"] } },
          { name: { in: ["김찬호", "테스트유저", "홍길동", "Patch전"] } },
        ],
      },
    });

    await prisma.$disconnect();
  });

  describe("POST /residents/register", () => {
    test("입주민 개별 등록 성공", async () => {
      const userData = {
        building: 108,
        unitNumber: 1503,
        contact: "01098765432",
        email: "test11232@gmail.com",
        name: "테스트유저",
        isHouseholder: "HOUSEHOLDER",
      };

      const res = await request(app).post("/residents/register").send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject(userData);

      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
    });

    test("중복 이메일로 등록 시도시 에러", async () => {
      const res = await request(app).post("/residents/register").send({
        building: 108,
        unitNumber: 1504,
        contact: "01087654321",
        email: "test@gmail.com",
        name: "중복테스트",
        isHouseholder: "HOUSEHOLDER",
      });

      expect(res.status).toBe(400);
    });

    test("필수 필드 누락 시 400 에러", async () => {
      const res = await request(app).post("/residents/register").send({
        unitNumber: 1502,
        contact: "01012341234",
      });

      expect(res.status).toBe(400);
      expect(res.body.message || res.body.error).toBeDefined();
    });

    test("잘못된 연락처 형식으로 등록 시도시 에러", async () => {
      const res = await request(app).post("/residents/register").send({
        building: 108,
        unitNumber: 1505,
        contact: "010-1234",
        email: "invalid@gmail.com",
        name: "형식테스트",
        isHouseholder: "HOUSEHOLDER",
      });

      expect(res.status).toBe(400);
    });

    test("잘못된 이메일 형식으로 등록 시도시 에러", async () => {
      const res = await request(app).post("/residents/register").send({
        building: 108,
        unitNumber: 1506,
        contact: "01012345678",
        email: "invalid-email",
        name: "이메일테스트",
        isHouseholder: "HOUSEHOLDER",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /residents", () => {
    test("조건 없이 요청하면 전체 입주민 리스트가 반환", async () => {
      const res = await request(app).get("/residents");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      expect(res.body[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          building: expect.any(Number),
          unitNumber: expect.any(Number),
          email: expect.any(String),
          contact: expect.any(String),
          isHouseholder: expect.any(String),
        })
      );
    });
  });

  describe("GET /residents/:id", () => {
    test("입주민 상세 조회 성공", async () => {
      const res = await request(app).get(`/residents/${testResidentId}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: testResidentId,
        name: "김찬호",
        building: 108,
        unitNumber: 1502,
        email: "test@gmail.com",
        contact: "01012341234",
        isHouseholder: "HOUSEHOLDER",
      });
    });

    test("존재하지 않는 ID로 조회시 404 에러", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const res = await request(app).get(`/residents/${nonExistentId}`);

      expect(res.status).toBe(404);
    });

    test("잘못된 ID 형식으로 조회시 400 에러", async () => {
      const invalidId = "invalid-id-format";
      const res = await request(app).get(`/residents/${invalidId}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /residents/:id", () => {
    test("입주민 정보 수정 성공", async () => {
      const updateData = {
        name: "김찬호수정",
        contact: "01099999999",
      };

      const res = await request(app)
        .put(`/residents/${testResidentId}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(updateData);

      const updatedResident = await prisma.residents.findUnique({
        where: { id: testResidentId },
      });
      expect(updatedResident?.name).toBe(updateData.name);
      expect(updatedResident?.contact).toBe(updateData.contact);
    });

    test("존재하지 않는 입주민 수정시 404 에러", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const res = await request(app)
        .put(`/residents/${nonExistentId}`)
        .send({ name: "존재안함" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /residents/:id", () => {
    test("입주민 삭제 성공", async () => {
      const deleteTestResident = await prisma.residents.create({
        data: {
          building: 108,
          unitNumber: 9999,
          contact: "01000000000",
          email: "delete@test.com",
          name: "삭제테스트",
          isHouseholder: "HOUSEHOLDER",
          residenceStatus: "RESIDENCE",
          isRegistered: true,
          approvalStatus: "APPROVED",
          apartmentId: "2149430f-2892-463f-b3e7-4e893548c6d6",
        },
      });

      const res = await request(app).delete(
        `/residents/${deleteTestResident.id}`
      );

      expect(res.status).toBe(200);

      const deletedResident = await prisma.residents.findUnique({
        where: { id: deleteTestResident.id },
      });
      expect(deletedResident).toBeNull();
    });

    test("존재하지 않는 입주민 삭제시 404 에러", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const res = await request(app).delete(`/residents/${nonExistentId}`);

      expect(res.status).toBe(404);
    });
  });
});
