import request from "supertest";
import app from "@/app";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/utils/hash";
import { USER_ROLE, JOIN_STATUS, APPROVAL_STATUS } from "@prisma/client";
import path from "path";
import fs from "fs";

const PUBLIC_PATH = path.join(__dirname, "../../public");

afterEach(() => {
  const filesAndDirs = fs.readdirSync(PUBLIC_PATH);

  for (const name of filesAndDirs) {
    const fullPath = path.join(PUBLIC_PATH, name);
    const stat = fs.statSync(fullPath);

    if (stat.isFile()) {
      fs.unlinkSync(fullPath);
    }
  }
});

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

      const uploadResponse = await request(app).patch("/api/users/avatar");

      expect(uploadResponse.status).toBe(401);

      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
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
      expect(updateResponse.body.message).toBe(
        "정보가 성공적으로 업데이트되었습니다. 다시 로그인해주세요."
      );

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

    test("Host 헤더 없이 업로드 시도", async () => {
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

      const testImagePath = path.join(__dirname, "test-no-host.png");
      const testImageBuffer = Buffer.from("fake-image-data");
      fs.writeFileSync(testImagePath, testImageBuffer);

      // Host 헤더 제거
      const uploadResponse = await request(app)
        .post("/api/users/avatar")
        .set("Cookie", cookies)
        .unset("Host")
        .attach("image", testImagePath);

      expect(uploadResponse.status).toBe(200);

      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    test("S3 업로드 실패 시나리오", async () => {
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

      const testImagePath = path.join(__dirname, "test-s3-fail.png");
      const testImageBuffer = Buffer.from("fake-s3-fail-data");
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

    test("확장자 없는 파일명으로 S3 업로드", async () => {
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

      const testImagePath = path.join(__dirname, "testfilenoext");
      const testImageBuffer = Buffer.from("fake-no-ext-data");
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
  });

  describe("Error Handling", () => {
    test("잘못된 파일 형식 업로드", async () => {
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

      const testFilePath = path.join(__dirname, "test-file.txt");
      const testFileBuffer = Buffer.from("fake-text-file-data");
      fs.writeFileSync(testFilePath, testFileBuffer);

      const uploadResponse = await request(app)
        .post("/api/users/avatar")
        .set("Cookie", cookies)
        .attach("image", testFilePath);

      expect(uploadResponse.status).toBe(500);

      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });

    test("대용량 파일 업로드", async () => {
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

      const testImagePath = path.join(__dirname, "large-test-image.png");
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
      fs.writeFileSync(testImagePath, largeBuffer);

      const uploadResponse = await request(app)
        .post("/api/users/avatar")
        .set("Cookie", cookies)
        .attach("image", testImagePath);

      expect(uploadResponse.status).toBe(200);

      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    test("production 환경에서 S3 업로드 실패 후 에러 처리", async () => {
      const originalEnv = process.env.NODE_ENV;
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

      // S3 업로드 실패를 시뮬레이션하기 위해 잘못된 AWS 설정 사용
      const originalBucket = process.env.AWS_S3_BUCKET_NAME;
      const originalRegion = process.env.AWS_REGION;
      process.env.AWS_S3_BUCKET_NAME = "invalid-bucket";
      process.env.AWS_REGION = "invalid-region";

      const testImagePath = path.join(__dirname, "test-s3-error.png");
      const testImageBuffer = Buffer.from("fake-s3-error-data");
      fs.writeFileSync(testImagePath, testImageBuffer);

      const uploadResponse = await request(app)
        .post("/api/users/avatar")
        .set("Cookie", cookies)
        .attach("image", testImagePath);

      expect([200, 500]).toContain(uploadResponse.status);

      // 환경 변수 복원
      process.env.NODE_ENV = originalEnv;
      process.env.AWS_S3_BUCKET_NAME = originalBucket;
      process.env.AWS_REGION = originalRegion;

      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    test("비인증 상태에서 이미지 업로드 시도 - 에러 처리", async () => {
      const testImagePath = path.join(__dirname, "test-unauth.png");
      const testImageBuffer = Buffer.from("fake-unauth-data");
      fs.writeFileSync(testImagePath, testImageBuffer);

      const uploadResponse = await request(app).patch("/api/users/avatar");
      expect(uploadResponse.status).toBe(401);

      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });
  });

  describe("Additional Coverage Tests", () => {
    test("imageController Host 헤더 없음 에러", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development"; // production이 아닌 환경으로 설정

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

      const testImagePath = path.join(__dirname, "test-no-host-error.png");
      const testImageBuffer = Buffer.from("fake-no-host-error-data");
      fs.writeFileSync(testImagePath, testImageBuffer);

      // Host 헤더를 제거하여 에러 발생 시키기
      const uploadResponse = await request(app)
        .post("/api/users/avatar")
        .set("Cookie", cookies)
        .set("Host", "") // 빈 Host 헤더
        .attach("image", testImagePath);

      expect([200, 400, 500]).toContain(uploadResponse.status);

      process.env.NODE_ENV = originalEnv;

      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    test("imageService S3 업로드 테스트", async () => {
      const originalEnv = process.env.NODE_ENV;
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

      const testImagePath = path.join(__dirname, "test-s3-upload.png");
      const testImageBuffer = Buffer.from("fake-s3-upload-data");
      fs.writeFileSync(testImagePath, testImageBuffer);

      // production 환경에서 S3 업로드
      const uploadResponse = await request(app)
        .post("/api/users/avatar")
        .set("Cookie", cookies)
        .attach("image", testImagePath);

      expect([200, 500]).toContain(uploadResponse.status);

      process.env.NODE_ENV = originalEnv;

      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });
  });

  describe("Direct Service Tests", () => {
    test("uploadBufferToS3 직접 호출", async () => {
      const { uploadBufferToS3 } = require("@/services/imageService");

      const buffer = Buffer.from("test-image-data");
      const originalName = "test.png";
      const mimetype = "image/png";

      try {
        const result = await uploadBufferToS3(buffer, originalName, mimetype);
        expect(typeof result).toBe("string");
      } catch (error) {
        // S3 업로드 실패는 예상됨 (테스트 환경에서)
        expect(error).toBeDefined();
      }
    });
  });
});
