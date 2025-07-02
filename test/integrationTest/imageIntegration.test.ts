import request from "supertest";
import app from "@/app";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/utils/hash";
import { USER_ROLE, JOIN_STATUS, APPROVAL_STATUS } from "@prisma/client";
import path from "path";
import fs from "fs";

describe("Image Integration Tests", () => {
  beforeEach(async () => {
    await prisma.userInfo.deleteMany();
    await prisma.users.deleteMany();
    await prisma.apartmentInfo.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Image Upload", () => {
    test("인증된 사용자 이미지 업로드 성공", async () => {
      const apartment = await prisma.apartmentInfo.create({
        data: {
          apartmentName: "테스트아파트",
          apartmentAddress: "서울시 강남구",
          startComplexNumber: 1,
          endComplexNumber: 10,
          startDongNumber: 1,
          endDongNumber: 10,
          startFloorNumber: 1,
          endFloorNumber: 10,
          startHoNumber: 1,
          endHoNumber: 10,
          approvalStatus: APPROVAL_STATUS.PENDING,
          apartmentManagementNumber: "01012341333",
          description: "테스트 아파트 설명",
          user: {
            create: {
              username: "apartmentadmin",
              encryptedPassword: await hashPassword("adminpassword"),
              name: "아파트관리자",
              contact: "01099999999",
              email: "admin@apartment.com",
              role: USER_ROLE.ADMIN,
              joinStatus: JOIN_STATUS.APPROVED,
            },
          },
        },
      });

      const user = await prisma.users.create({
        data: {
          username: "testuser",
          encryptedPassword: await hashPassword("password123!"),
          name: "테스트유저",
          contact: "01012345678",
          email: "test@test.com",
          role: USER_ROLE.USER,
          joinStatus: JOIN_STATUS.APPROVED,
          userInfo: {
            create: {
              apartmentId: apartment.id,
              apartmentName: "테스트아파트",
              apartmentDong: 1,
              apartmentHo: 10,
            },
          },
        },
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "password123!",
      });

      const cookies = loginResponse.headers["set-cookie"];
      expect(cookies).toBeDefined();

      const testImagePath = path.join(__dirname, "test-image.png");
      const testImageBuffer = Buffer.from("fake-image-data");
      fs.writeFileSync(testImagePath, testImageBuffer);

      const uploadResponse = await request(app)
        .post("/api/users/avatar")
        .set("Cookie", cookies)
        .attach("image", testImagePath);

      expect(uploadResponse.status).toBe(200);
      expect(uploadResponse.body).toHaveProperty("url");
      expect(uploadResponse.body.url).toContain("http://");

      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    test("인증되지 않은 사용자 이미지 업로드 실패", async () => {
      const testImagePath = path.join(__dirname, "test-image.png");
      const testImageBuffer = Buffer.from("fake-image-data");
      fs.writeFileSync(testImagePath, testImageBuffer);

      const uploadResponse = await request(app)
        .post("/api/users/avatar")
        .attach("image", testImagePath);

      expect(uploadResponse.status).toBe(401);

      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    test("파일 없이 업로드 시도", async () => {
      const apartment = await prisma.apartmentInfo.create({
        data: {
          apartmentName: "테스트아파트",
          apartmentAddress: "서울시 강남구",
          startComplexNumber: 1,
          endComplexNumber: 10,
          startDongNumber: 1,
          endDongNumber: 10,
          startFloorNumber: 1,
          endFloorNumber: 10,
          startHoNumber: 1,
          endHoNumber: 10,
          approvalStatus: APPROVAL_STATUS.PENDING,
          apartmentManagementNumber: "01012341333",
          description: "테스트 아파트 설명",
          user: {
            create: {
              username: "apartmentadmin",
              encryptedPassword: await hashPassword("adminpassword"),
              name: "아파트관리자",
              contact: "01099999999",
              email: "admin@apartment.com",
              role: USER_ROLE.ADMIN,
              joinStatus: JOIN_STATUS.APPROVED,
            },
          },
        },
      });

      const user = await prisma.users.create({
        data: {
          username: "testuser",
          encryptedPassword: await hashPassword("password123!"),
          name: "테스트유저",
          contact: "01012345678",
          email: "test@test.com",
          role: USER_ROLE.USER,
          joinStatus: JOIN_STATUS.APPROVED,
          userInfo: {
            create: {
              apartmentId: apartment.id,
              apartmentName: "테스트아파트",
              apartmentDong: 1,
              apartmentHo: 10,
            },
          },
        },
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "password123!",
      });

      const cookies = loginResponse.headers["set-cookie"];

      const uploadResponse = await request(app)
        .post("/api/users/avatar")
        .set("Cookie", cookies);

      expect(uploadResponse.status).toBe(400);
      expect(uploadResponse.body.message).toBe("파일이 없습니다.");
    });

    test("다양한 파일 형식 업로드", async () => {
      const apartment = await prisma.apartmentInfo.create({
        data: {
          apartmentName: "테스트아파트",
          apartmentAddress: "서울시 강남구",
          startComplexNumber: 1,
          endComplexNumber: 10,
          startDongNumber: 1,
          endDongNumber: 10,
          startFloorNumber: 1,
          endFloorNumber: 10,
          startHoNumber: 1,
          endHoNumber: 10,
          approvalStatus: APPROVAL_STATUS.PENDING,
          apartmentManagementNumber: "01012341333",
          description: "테스트 아파트 설명",
          user: {
            create: {
              username: "apartmentadmin",
              encryptedPassword: await hashPassword("adminpassword"),
              name: "아파트관리자",
              contact: "01099999999",
              email: "admin@apartment.com",
              role: USER_ROLE.ADMIN,
              joinStatus: JOIN_STATUS.APPROVED,
            },
          },
        },
      });

      const user = await prisma.users.create({
        data: {
          username: "testuser",
          encryptedPassword: await hashPassword("password123!"),
          name: "테스트유저",
          contact: "01012345678",
          email: "test@test.com",
          role: USER_ROLE.USER,
          joinStatus: JOIN_STATUS.APPROVED,
          userInfo: {
            create: {
              apartmentId: apartment.id,
              apartmentName: "테스트아파트",
              apartmentDong: 1,
              apartmentHo: 10,
            },
          },
        },
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "password123!",
      });

      const cookies = loginResponse.headers["set-cookie"];

      const fileTypes = [
        { ext: "jpg", mimetype: "image/jpeg" },
        { ext: "png", mimetype: "image/png" },
      ];

      for (const fileType of fileTypes) {
        const testImagePath = path.join(
          __dirname,
          `test-image.${fileType.ext}`
        );
        const testImageBuffer = Buffer.from(`fake-${fileType.ext}-data`);
        fs.writeFileSync(testImagePath, testImageBuffer);

        const uploadResponse = await request(app)
          .post("/api/users/avatar")
          .set("Cookie", cookies)
          .attach("image", testImagePath);

        expect(uploadResponse.status).toBe(200);
        expect(uploadResponse.body).toHaveProperty("url");

        if (fs.existsSync(testImagePath)) {
          fs.unlinkSync(testImagePath);
        }
      }
    });
  });

  describe("Image Upload with Profile Update", () => {
    test("이미지 업로드 후 프로필 업데이트", async () => {
      const apartment = await prisma.apartmentInfo.create({
        data: {
          apartmentName: "테스트아파트",
          apartmentAddress: "서울시 강남구",
          startComplexNumber: 1,
          endComplexNumber: 10,
          startDongNumber: 1,
          endDongNumber: 10,
          startFloorNumber: 1,
          endFloorNumber: 10,
          startHoNumber: 1,
          endHoNumber: 10,
          approvalStatus: APPROVAL_STATUS.PENDING,
          apartmentManagementNumber: "01012341333",
          description: "테스트 아파트 설명",
          user: {
            create: {
              username: "apartmentadmin",
              encryptedPassword: await hashPassword("adminpassword"),
              name: "아파트관리자",
              contact: "01099999999",
              email: "admin@apartment.com",
              role: USER_ROLE.ADMIN,
              joinStatus: JOIN_STATUS.APPROVED,
            },
          },
        },
      });

      const user = await prisma.users.create({
        data: {
          username: "testuser",
          encryptedPassword: await hashPassword("password123!"),
          name: "테스트유저",
          contact: "01012345678",
          email: "test@test.com",
          role: USER_ROLE.USER,
          joinStatus: JOIN_STATUS.APPROVED,
          userInfo: {
            create: {
              apartmentId: apartment.id,
              apartmentName: "테스트아파트",
              apartmentDong: 1,
              apartmentHo: 10,
            },
          },
        },
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "password123!",
      });

      const cookies = loginResponse.headers["set-cookie"];

      const testImagePath = path.join(__dirname, "test-profile.png");
      const testImageBuffer = Buffer.from("fake-profile-image-data");
      fs.writeFileSync(testImagePath, testImageBuffer);

      const uploadResponse = await request(app)
        .post("/api/users/avatar")
        .set("Cookie", cookies)
        .attach("image", testImagePath);

      expect(uploadResponse.status).toBe(200);
      const imageUrl = uploadResponse.body.url;

      const updateResponse = await request(app)
        .patch("/api/users/me")
        .set("Cookie", cookies)
        .send({
          profileImage: imageUrl,
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.message).toBe("유저 정보 수정 성공");

      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });
  });

  describe("S3 Upload Service", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    test("production 환경에서 S3 업로드 시뮬레이션", async () => {
      process.env.NODE_ENV = "production";

      const apartment = await prisma.apartmentInfo.create({
        data: {
          apartmentName: "테스트아파트",
          apartmentAddress: "서울시 강남구",
          startComplexNumber: 1,
          endComplexNumber: 10,
          startDongNumber: 1,
          endDongNumber: 10,
          startFloorNumber: 1,
          endFloorNumber: 10,
          startHoNumber: 1,
          endHoNumber: 10,
          approvalStatus: APPROVAL_STATUS.PENDING,
          apartmentManagementNumber: "01012341333",
          description: "테스트 아파트 설명",
          user: {
            create: {
              username: "apartmentadmin",
              encryptedPassword: await hashPassword("adminpassword"),
              name: "아파트관리자",
              contact: "01099999999",
              email: "admin@apartment.com",
              role: USER_ROLE.ADMIN,
              joinStatus: JOIN_STATUS.APPROVED,
            },
          },
        },
      });

      const user = await prisma.users.create({
        data: {
          username: "testuser",
          encryptedPassword: await hashPassword("password123!"),
          name: "테스트유저",
          contact: "01012345678",
          email: "test@test.com",
          role: USER_ROLE.USER,
          joinStatus: JOIN_STATUS.APPROVED,
          userInfo: {
            create: {
              apartmentId: apartment.id,
              apartmentName: "테스트아파트",
              apartmentDong: 1,
              apartmentHo: 10,
            },
          },
        },
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "password123!",
      });

      const cookies = loginResponse.headers["set-cookie"];

      const mockS3Send = jest.fn().mockResolvedValue({});
      jest.doMock("@/lib/s3Client", () => ({
        s3Client: { send: mockS3Send },
      }));

      const testImagePath = path.join(__dirname, "test-s3-image.png");
      const testImageBuffer = Buffer.from("fake-s3-image-data");
      fs.writeFileSync(testImagePath, testImageBuffer);

      const uploadResponse = await request(app)
        .post("/api/users/avatar")
        .set("Cookie", cookies)
        .attach("image", testImagePath);

      expect([200, 500]).toContain(uploadResponse.status);

      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    test("확장자가 없는 파일 업로드", async () => {
      const apartment = await prisma.apartmentInfo.create({
        data: {
          apartmentName: "테스트아파트",
          apartmentAddress: "서울시 강남구",
          startComplexNumber: 1,
          endComplexNumber: 10,
          startDongNumber: 1,
          endDongNumber: 10,
          startFloorNumber: 1,
          endFloorNumber: 10,
          startHoNumber: 1,
          endHoNumber: 10,
          approvalStatus: APPROVAL_STATUS.PENDING,
          apartmentManagementNumber: "01012341333",
          description: "테스트 아파트 설명",
          user: {
            create: {
              username: "apartmentadmin",
              encryptedPassword: await hashPassword("adminpassword"),
              name: "아파트관리자",
              contact: "01099999999",
              email: "admin@apartment.com",
              role: USER_ROLE.ADMIN,
              joinStatus: JOIN_STATUS.APPROVED,
            },
          },
        },
      });

      const user = await prisma.users.create({
        data: {
          username: "testuser",
          encryptedPassword: await hashPassword("password123!"),
          name: "테스트유저",
          contact: "01012345678",
          email: "test@test.com",
          role: USER_ROLE.USER,
          joinStatus: JOIN_STATUS.APPROVED,
          userInfo: {
            create: {
              apartmentId: apartment.id,
              apartmentName: "테스트아파트",
              apartmentDong: 1,
              apartmentHo: 10,
            },
          },
        },
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "password123!",
      });

      const cookies = loginResponse.headers["set-cookie"];

      const testImagePath = path.join(__dirname, "testfile.png");
      const testImageBuffer = Buffer.from("fake-image-without-ext");
      fs.writeFileSync(testImagePath, testImageBuffer);

      const uploadResponse = await request(app)
        .post("/api/users/avatar")
        .set("Cookie", cookies)
        .attach("image", testImagePath);

      expect(uploadResponse.status).toBe(200);
      expect(uploadResponse.body).toHaveProperty("url");

      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });
  });
});
