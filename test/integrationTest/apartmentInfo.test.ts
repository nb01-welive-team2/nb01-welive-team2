import request from "supertest";
import app from "@/app";
import path from "path";
const seedPath = path.resolve(__dirname, "../../prisma/seed");
const { seedDatabase } = require(seedPath);
const mockPath = path.resolve(__dirname, "../../prisma/mock");
const { mockUsers } = require(mockPath);

beforeEach(async () => {
  await seedDatabase();
});

describe("apartments 통합 테스트", () => {
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

  describe("GET /api/apartments", () => {
    test("관리자계정 로그인 - 아파트 목록 조회", async () => {
      const res = await adminAgent.get("/api/apartments");
      expect(res.status).toBe(200);

      const apt = res.body.apartments[0];
      expect(apt).toHaveProperty("id");
      expect(apt).toHaveProperty("name");

      expect(apt).toHaveProperty("officeNumber");
      expect(apt).toHaveProperty("description");

      expect(apt.dongRange).toEqual(
        expect.objectContaining({
          start: expect.anything(),
          end: expect.anything(),
        })
      );
    });

    test("슈퍼관리자계정 로그인 - 아파트 목록 조회", async () => {
      const res = await superAdminAgent.get("/api/apartments");
      expect(res.status).toBe(200);

      const apt = res.body.apartments[0];
      expect(apt).toHaveProperty("id");
      expect(apt).toHaveProperty("name");

      expect(apt).toHaveProperty("officeNumber");
      expect(apt).toHaveProperty("description");

      expect(apt.dongRange).toEqual(
        expect.objectContaining({
          start: expect.anything(),
          end: expect.anything(),
        })
      );
    });

    test("비로그인 유저 - 아파트 목록 조회", async () => {
      const res = await request(app).get("/api/apartments");
      expect(res.status).toBe(200);

      const apt = res.body.apartments[0];
      expect(apt).toHaveProperty("id");
      expect(apt).toHaveProperty("name");

      expect(apt).not.toHaveProperty("officeNumber");
      expect(apt).not.toHaveProperty("description");
      expect(apt).not.toHaveProperty("dongRange");
    });
  });

  describe("GET /api/apartments/:id", () => {
    test("관리자 계정 로그인 - 아파트 정보 조회", async () => {
      const res = await adminAgent.get(
        `/api/apartments/2149430f-2892-463f-b3e7-4e893548c6d6`
      );
      expect(res.status).toBe(200);

      const apt = res.body;
      expect(apt).toHaveProperty("id");
      expect(apt).toHaveProperty("name");

      expect(apt.dongRange).toEqual(
        expect.objectContaining({
          start: expect.anything(),
          end: expect.anything(),
        })
      );
    });
    test("존재하지 않는 ID로 조회 404", async () => {
      const res = await adminAgent.get(
        `/api/apartments/00000000-0000-463f-b3e7-4e893548c6d6`
      );
      expect(res.status).toBe(404);
    });
  });
});
