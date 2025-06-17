import request from "supertest";
import app from "../app";

describe("GET /residents", () => {
  test("관리자가 입주민 목록 조회했을 때", async () => {
    const res = await request(app).get("/residents").query({
      building: "101",
      unitNumber: "1001",
      residenceStatus: "RESIDENCE",
      isRegistered: true,
      name: "김",
      contact: "010-1234-1234",
    });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
          building: "101",
          unitNumber: "1001",
          residenceStatus: "RESIDENCE",
          isRegistered: true,
        }),
      ])
    );
  });
});
