import request from "supertest";
import app from "@/app";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/utils/hash";
import { USER_ROLE, JOIN_STATUS, APPROVAL_STATUS } from "@prisma/client";

describe("User & Auth Integration Tests", () => {
  beforeEach(async () => {
    await prisma.userInfo.deleteMany();
    await prisma.users.deleteMany();
    await prisma.apartmentInfo.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Auth Flow", () => {
    test("회원가입 -> 로그인 -> 토큰 갱신 -> 로그아웃", async () => {
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

      const signupResponse = await request(app).post("/api/auth/signup").send({
        username: "testuser",
        password: "password123!",
        name: "테스트유저",
        contact: "01012345678",
        email: "test@test.com",
        role: "USER",
        apartmentName: "테스트아파트",
        apartmentDong: "1",
        apartmentHo: "10",
      });

      expect(signupResponse.status).toBe(201);

      const user = await prisma.users.findUnique({
        where: { username: "testuser" },
      });
      await prisma.users.update({
        where: { id: user!.id },
        data: { joinStatus: JOIN_STATUS.APPROVED },
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "password123!",
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.message).toBe("로그인이 완료되었습니다");

      const cookies = loginResponse.headers["set-cookie"];
      expect(cookies).toBeDefined();

      const refreshResponse = await request(app)
        .post("/api/auth/refresh")
        .set("cookie", cookies);

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.message).toBe("토큰 갱신이 완료되었습니다");

      const logoutResponse = await request(app)
        .post("/api/auth/logout")
        .set("cookie", cookies);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.message).toBe("로그아웃이 완료되었습니다");
    });
  });

  describe("User Management Flow", () => {
    test("슈퍼관리자 -> 관리자 승인 -> 관리자 -> 사용자 승인", async () => {
      const superAdminResponse = await request(app)
        .post("/api/auth/signup/super-admin")
        .send({
          username: "superadmin",
          password: "password123!",
          name: "슈퍼관리자",
          contact: "01011112222",
          email: "super@test.com",
          role: "SUPER_ADMIN",
          joinStatus: "APPROVED",
        });

      expect(superAdminResponse.status).toBe(201);

      const superAdmin = await prisma.users.findUnique({
        where: { username: "superadmin" },
      });
      await prisma.users.update({
        where: { id: superAdmin!.id },
        data: { joinStatus: JOIN_STATUS.APPROVED },
      });

      const superAdminLogin = await request(app).post("/api/auth/login").send({
        username: "superadmin",
        password: "password123!",
      });

      const superAdminCookies = superAdminLogin.headers["set-cookie"];

      const adminResponse = await request(app)
        .post("/api/auth/signup/admin")
        .send({
          username: "admin",
          password: "password123!",
          name: "관리자",
          contact: "01011111111",
          email: "admin@test.com",
          role: "ADMIN",
          apartmentName: "관리아파트",
          apartmentAddress: "서울시 서초구",
          apartmentManagementNumber: "02-1234-5678",
          description: "관리아파트 설명",
          startComplexNumber: "1",
          endComplexNumber: "10",
          startDongNumber: "1",
          endDongNumber: "10",
          startFloorNumber: "1",
          endFloorNumber: "10",
          startHoNumber: "1",
          endHoNumber: "10",
        });

      expect(adminResponse.status).toBe(201);

      const admin = await prisma.users.findUnique({
        where: { username: "admin" },
      });

      const approveAdminResponse = await request(app)
        .post("/api/auth/approve-admin") // 오타 수정
        .set("cookie", superAdminCookies)
        .send({ id: admin!.id });

      expect(approveAdminResponse.status).toBe(200);
      expect(approveAdminResponse.body.message).toBe(
        "관리자 가입 승인이 완료되었습니다"
      );
    });
  });

  describe("Password Update Flow", () => {
    test("사용자 비밀번호 변경", async () => {
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

      const hashedPassword = await hashPassword("oldpassword123!");
      const user = await prisma.users.create({
        data: {
          username: "testuser",
          encryptedPassword: hashedPassword,
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
        password: "oldpassword123!",
      });

      expect(loginResponse.status).toBe(200);
      const cookies = loginResponse.headers["set-cookie"];
      expect(cookies).toBeDefined();

      const updatePasswordResponse = await request(app)
        .patch("/api/users/password")
        .set("Cookie", cookies)
        .send({
          currentPassword: "oldpassword123!",
          newPassword: "newpassword123!",
        });

      expect(updatePasswordResponse.status).toBe(200);
      expect(updatePasswordResponse.body.message).toBe("비밀번호 변경 완료");

      const newLoginResponse = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "newpassword123!",
      });

      expect(newLoginResponse.status).toBe(200);
    });
  });

  describe("User Profile Update", () => {
    test("사용자 프로필 이미지 업데이트", async () => {
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

      const hashedPassword = await hashPassword("password123!");
      const user = await prisma.users.create({
        data: {
          username: "testuser",
          encryptedPassword: hashedPassword,
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

      expect(loginResponse.status).toBe(200);
      const cookies = loginResponse.headers["set-cookie"];
      expect(cookies).toBeDefined();

      const updateResponse = await request(app)
        .patch("/api/users/me")
        .set("Cookie", cookies)
        .send({
          profileImage: "new-profile.jpg",
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.message).toBe("유저 정보 수정 성공");
    });
  });

  describe("Admin Management Flow", () => {
    test("관리자 수정 및 삭제", async () => {
      const superAdmin = await prisma.users.create({
        data: {
          username: "superadmin",
          encryptedPassword: await hashPassword("password123!"),
          name: "슈퍼관리자",
          contact: "01011112222",
          email: "super@test.com",
          role: USER_ROLE.SUPER_ADMIN,
          joinStatus: JOIN_STATUS.APPROVED,
        },
      });

      const admin = await prisma.users.create({
        data: {
          username: "admin",
          encryptedPassword: await hashPassword("password123!"),
          name: "관리자",
          contact: "01011111111",
          email: "admin@test.com",
          role: USER_ROLE.ADMIN,
          joinStatus: JOIN_STATUS.APPROVED,
          apartmentInfo: {
            create: {
              apartmentName: "관리아파트",
              apartmentAddress: "서울시 서초구",
              startComplexNumber: 1,
              endComplexNumber: 5,
              startDongNumber: 1,
              endDongNumber: 5,
              startFloorNumber: 1,
              endFloorNumber: 15,
              startHoNumber: 1,
              endHoNumber: 30,
              approvalStatus: APPROVAL_STATUS.PENDING,
              apartmentManagementNumber: "02-1234-5678",
              description: "관리아파트 설명",
            },
          },
        },
      });

      const superAdminLogin = await request(app).post("/api/auth/login").send({
        username: "superadmin",
        password: "password123!",
      });
      const superAdminCookies = superAdminLogin.headers["set-cookie"];

      const updateAdminResponse = await request(app)
        .patch("/api/auth/update-admin")
        .set("Cookie", superAdminCookies)
        .send({
          id: admin.id,
          contact: "01099999999",
          name: "수정된관리자",
          email: "updated@test.com",
          description: "수정된 설명",
          apartmentName: "수정된아파트",
          apartmentAddress: "수정된주소",
          apartmentManagementNumber: "02-9999-9999",
        });

      expect(updateAdminResponse.status).toBe(200);

      const deleteAdminResponse = await request(app)
        .delete(`/api/auth/deleted-admin/${admin.id}`) // 오타 수정
        .set("Cookie", superAdminCookies);

      expect(deleteAdminResponse.status).toBe(200);
      expect(deleteAdminResponse.body.message).toBe(
        "관리자 정보(아파트 정보 포함) 삭제가 완료되었습니다"
      );
    });

    test("관리자 거절 및 전체 승인/거절", async () => {
      const superAdmin = await prisma.users.create({
        data: {
          username: "superadmin",
          encryptedPassword: await hashPassword("password123!"),
          name: "슈퍼관리자",
          contact: "01011112222",
          email: "super@test.com",
          role: USER_ROLE.SUPER_ADMIN,
          joinStatus: JOIN_STATUS.APPROVED,
        },
      });

      const admin = await prisma.users.create({
        data: {
          username: "admin",
          encryptedPassword: await hashPassword("password123!"),
          name: "관리자",
          contact: "01011111111",
          email: "admin@test.com",
          role: USER_ROLE.ADMIN,
          joinStatus: JOIN_STATUS.PENDING,
        },
      });

      const superAdminLogin = await request(app).post("/api/auth/login").send({
        username: "superadmin",
        password: "password123!",
      });
      const superAdminCookies = superAdminLogin.headers["set-cookie"];

      const rejectAdminResponse = await request(app)
        .post("/api/auth/reject-admin") // 오타 수정
        .set("Cookie", superAdminCookies)
        .send({ id: admin.id });

      expect(rejectAdminResponse.status).toBe(200);
      expect(rejectAdminResponse.body.message).toBe(
        "관리자 가입 거절이 완료되었습니다"
      );

      const approveAllResponse = await request(app)
        .post("/api/auth/approve-admins") // 오타 수정
        .set("Cookie", superAdminCookies);

      expect(approveAllResponse.status).toBe(200);
      expect(approveAllResponse.body.message).toBe(
        "관리자 가입 전체 승인이 완료되었습니다"
      );

      const rejectAllResponse = await request(app)
        .post("/api/auth/reject-admins") // 오타 수정
        .set("Cookie", superAdminCookies);

      expect(rejectAllResponse.status).toBe(200);
      expect(rejectAllResponse.body.message).toBe(
        "관리자 가입 전체 거절이 완료되었습니다"
      );
    });
  });

  describe("User Management by Admin", () => {
    test("관리자가 사용자 거절 및 전체 관리", async () => {
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
              username: "admin",
              encryptedPassword: await hashPassword("password123!"),
              name: "관리자",
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
          joinStatus: JOIN_STATUS.PENDING,
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

      const adminLogin = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "password123!",
      });
      const adminCookies = adminLogin.headers["set-cookie"];

      const rejectUserResponse = await request(app)
        .post(`/api/auth/reject-user/${user.id}`)
        .set("Cookie", adminCookies);

      expect(rejectUserResponse.status).toBe(200);
      expect(rejectUserResponse.body.message).toBe(
        "사용자 가입 요청 거절 성공"
      );

      const approveAllUsersResponse = await request(app)
        .post("/api/auth/approve-users")
        .set("Cookie", adminCookies);

      expect(approveAllUsersResponse.status).toBe(200);
      expect(approveAllUsersResponse.body.message).toBe(
        "사용자 가입 요청 전체 승인 성공"
      );

      const rejectAllUsersResponse = await request(app)
        .post("/api/auth/reject-users")
        .set("Cookie", adminCookies);

      expect(rejectAllUsersResponse.status).toBe(200);
      expect(rejectAllUsersResponse.body.message).toBe(
        "사용자 가입 요청 전체 거절 성공"
      );
    });
  });

  describe("Cleanup Operations", () => {
    test("거절된 사용자 정리 - 슈퍼관리자", async () => {
      const superAdmin = await prisma.users.create({
        data: {
          username: "superadmin",
          encryptedPassword: await hashPassword("password123!"),
          name: "슈퍼관리자",
          contact: "01011112222",
          email: "super@test.com",
          role: USER_ROLE.SUPER_ADMIN,
          joinStatus: JOIN_STATUS.APPROVED,
        },
      });

      const superAdminLogin = await request(app).post("/api/auth/login").send({
        username: "superadmin",
        password: "password123!",
      });
      const superAdminCookies = superAdminLogin.headers["set-cookie"];

      const cleanupResponse = await request(app)
        .post("/api/auth/cleanup")
        .set("Cookie", superAdminCookies);

      expect(cleanupResponse.status).toBe(200);
      expect(cleanupResponse.body.message).toBe(
        "관리자 정보(아파트 정보 포함) 삭제가 완료되었습니다"
      );
    });

    test("거절된 사용자 정리 - 관리자", async () => {
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
              username: "admin",
              encryptedPassword: await hashPassword("password123!"),
              name: "관리자",
              contact: "01099999999",
              email: "admin@apartment.com",
              role: USER_ROLE.ADMIN,
              joinStatus: JOIN_STATUS.APPROVED,
            },
          },
        },
      });

      const adminLogin = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "password123!",
      });
      const adminCookies = adminLogin.headers["set-cookie"];

      const cleanupResponse = await request(app)
        .post("/api/auth/cleanup")
        .set("Cookie", adminCookies);

      expect(cleanupResponse.status).toBe(200);
      expect(cleanupResponse.body.message).toBe(
        "관리자 정보(아파트 정보 포함) 삭제가 완료되었습니다"
      );
    });
  });

  describe("Error Cases", () => {
    test("비승인 사용자 로그인 시도", async () => {
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
          username: "pendinguser",
          encryptedPassword: await hashPassword("password123!"),
          name: "대기중유저",
          contact: "01012345678",
          email: "pending@test.com",
          role: USER_ROLE.USER,
          joinStatus: JOIN_STATUS.PENDING,
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
        username: "pendinguser",
        password: "password123!",
      });

      expect(loginResponse.status).toBe(401);
    });

    test("존재하지 않는 사용자 로그인 시도", async () => {
      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "nonexistentuser",
        password: "password123!",
      });

      expect(loginResponse.status).toBe(401);
    });

    test("잘못된 비밀번호로 로그인 시도", async () => {
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
        password: "wrongpassword",
      });

      expect(loginResponse.status).toBe(401);
    });

    test("존재하지 않는 아파트로 회원가입 시도", async () => {
      const signupResponse = await request(app).post("/api/auth/signup").send({
        username: "testuser",
        password: "password123!",
        name: "테스트유저",
        contact: "01012345678",
        email: "test@test.com",
        role: "USER",
        apartmentName: "존재하지않는아파트",
        apartmentDong: "1",
        apartmentHo: "10",
      });

      expect(signupResponse.status).toBe(500);
    });

    test("권한 없는 사용자가 관리자 승인 시도", async () => {
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
          username: "normaluser",
          encryptedPassword: await hashPassword("password123!"),
          name: "일반유저",
          contact: "01012345678",
          email: "user@test.com",
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

      const admin = await prisma.users.create({
        data: {
          username: "admin",
          encryptedPassword: await hashPassword("password123!"),
          name: "관리자",
          contact: "01011111111",
          email: "admin@test.com",
          role: USER_ROLE.ADMIN,
          joinStatus: JOIN_STATUS.PENDING,
        },
      });

      const userLogin = await request(app).post("/api/auth/login").send({
        username: "normaluser",
        password: "password123!",
      });
      const userCookies = userLogin.headers["set-cookie"];
      expect(userCookies).toBeDefined();

      const approveResponse = await request(app)
        .post("/api/auth/approve-admin") // 오타 수정
        .set("Cookie", userCookies)
        .send({ id: admin.id });

      expect(approveResponse.status).toBe(401);
    });

    test("잘못된 리프레시 토큰으로 갱신 시도", async () => {
      const refreshResponse = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", ["refreshToken=invalid-token"]);

      expect(refreshResponse.status).toBe(401);
    });

    test("리프레시 토큰 없이 갱신 시도", async () => {
      const refreshResponse = await request(app).post("/api/auth/refresh");

      expect(refreshResponse.status).toBe(401);
    });

    test("존재하지 않는 관리자 수정 시도", async () => {
      const superAdmin = await prisma.users.create({
        data: {
          username: "superadmin",
          encryptedPassword: await hashPassword("password123!"),
          name: "슈퍼관리자",
          contact: "01011112222",
          email: "super@test.com",
          role: USER_ROLE.SUPER_ADMIN,
          joinStatus: JOIN_STATUS.APPROVED,
        },
      });

      const superAdminLogin = await request(app).post("/api/auth/login").send({
        username: "superadmin",
        password: "password123!",
      });
      const superAdminCookies = superAdminLogin.headers["set-cookie"];

      const updateResponse = await request(app)
        .patch("/api/auth/update-admin")
        .set("Cookie", superAdminCookies)
        .send({
          id: "nonexistent-id",
          contact: "01099999999",
          name: "수정된관리자",
          email: "updated@test.com",
          description: "수정된 설명",
          apartmentName: "수정된아파트",
          apartmentAddress: "수정된주소",
          apartmentManagementNumber: "02-9999-9999",
        });

      expect(updateResponse.status).toBe(401);
    });

    test("일반 사용자를 관리자로 수정 시도", async () => {
      const superAdmin = await prisma.users.create({
        data: {
          username: "superadmin",
          encryptedPassword: await hashPassword("password123!"),
          name: "슈퍼관리자",
          contact: "01011112222",
          email: "super@test.com",
          role: USER_ROLE.SUPER_ADMIN,
          joinStatus: JOIN_STATUS.APPROVED,
        },
      });

      const user = await prisma.users.create({
        data: {
          username: "normaluser",
          encryptedPassword: await hashPassword("password123!"),
          name: "일반유저",
          contact: "01012345678",
          email: "user@test.com",
          role: USER_ROLE.USER,
          joinStatus: JOIN_STATUS.APPROVED,
        },
      });

      const superAdminLogin = await request(app).post("/api/auth/login").send({
        username: "superadmin",
        password: "password123!",
      });
      const superAdminCookies = superAdminLogin.headers["set-cookie"];

      const updateResponse = await request(app)
        .patch("/api/auth/update-admin")
        .set("Cookie", superAdminCookies)
        .send({
          id: user.id,
          contact: "01099999999",
          name: "수정된관리자",
          email: "updated@test.com",
          description: "수정된 설명",
          apartmentName: "수정된아파트",
          apartmentAddress: "수정된주소",
          apartmentManagementNumber: "02-9999-9999",
        });

      expect(updateResponse.status).toBe(401);
    });

    test("존재하지 않는 관리자 삭제 시도", async () => {
      const superAdmin = await prisma.users.create({
        data: {
          username: "superadmin",
          encryptedPassword: await hashPassword("password123!"),
          name: "슈퍼관리자",
          contact: "01011112222",
          email: "super@test.com",
          role: USER_ROLE.SUPER_ADMIN,
          joinStatus: JOIN_STATUS.APPROVED,
        },
      });

      const superAdminLogin = await request(app).post("/api/auth/login").send({
        username: "superadmin",
        password: "password123!",
      });
      const superAdminCookies = superAdminLogin.headers["set-cookie"];

      const deleteResponse = await request(app)
        .delete("/api/auth/deleted-admin/nonexistent-id")
        .set("Cookie", superAdminCookies);

      expect(deleteResponse.status).toBe(401);
    });

    test("일반 사용자 삭제 시도", async () => {
      const superAdmin = await prisma.users.create({
        data: {
          username: "superadmin",
          encryptedPassword: await hashPassword("password123!"),
          name: "슈퍼관리자",
          contact: "01011112222",
          email: "super@test.com",
          role: USER_ROLE.SUPER_ADMIN,
          joinStatus: JOIN_STATUS.APPROVED,
        },
      });

      const user = await prisma.users.create({
        data: {
          username: "normaluser",
          encryptedPassword: await hashPassword("password123!"),
          name: "일반유저",
          contact: "01012345678",
          email: "user@test.com",
          role: USER_ROLE.USER,
          joinStatus: JOIN_STATUS.APPROVED,
        },
      });

      const superAdminLogin = await request(app).post("/api/auth/login").send({
        username: "superadmin",
        password: "password123!",
      });
      const superAdminCookies = superAdminLogin.headers["set-cookie"];

      const deleteResponse = await request(app)
        .delete(`/api/auth/deleted-admin/${user.id}`)
        .set("Cookie", superAdminCookies);

      expect(deleteResponse.status).toBe(401);
    });

    test("존재하지 않는 사용자 정보 수정 시도", async () => {
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

      const fakeUser = await prisma.users.create({
        data: {
          username: "fakeuser",
          encryptedPassword: await hashPassword("password123!"),
          name: "가짜유저",
          contact: "01012345678",
          email: "fake@test.com",
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
        username: "fakeuser",
        password: "password123!",
      });
      const cookies = loginResponse.headers["set-cookie"];

      await prisma.users.delete({ where: { id: fakeUser.id } });

      const updateResponse = await request(app)
        .patch("/api/users/me")
        .set("Cookie", cookies)
        .send({
          profileImage: "new-profile.jpg",
        });

      expect(updateResponse.status).toBe(401);
    });

    test("잘못된 현재 비밀번호로 비밀번호 변경 시도", async () => {
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

      const updateResponse = await request(app)
        .patch("/api/users/me")
        .set("Cookie", cookies)
        .send({
          currentPassword: "wrongpassword",
          newPassword: "newpassword123!",
        });

      expect(updateResponse.status).toBe(401);
    });

    test("일반 사용자가 거절된 사용자 정리 시도", async () => {
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
          username: "normaluser",
          encryptedPassword: await hashPassword("password123!"),
          name: "일반유저",
          contact: "01012345678",
          email: "user@test.com",
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

      const userLogin = await request(app).post("/api/auth/login").send({
        username: "normaluser",
        password: "password123!",
      });
      const userCookies = userLogin.headers["set-cookie"];

      const cleanupResponse = await request(app)
        .post("/api/auth/cleanup")
        .set("Cookie", userCookies);

      expect(cleanupResponse.status).toBe(401);
    });

    test("존재하지 않는 관리자 승인 시도", async () => {
      const superAdmin = await prisma.users.create({
        data: {
          username: "superadmin",
          encryptedPassword: await hashPassword("password123!"),
          name: "슈퍼관리자",
          contact: "01011112222",
          email: "super@test.com",
          role: USER_ROLE.SUPER_ADMIN,
          joinStatus: JOIN_STATUS.APPROVED,
        },
      });

      const superAdminLogin = await request(app).post("/api/auth/login").send({
        username: "superadmin",
        password: "password123!",
      });
      const superAdminCookies = superAdminLogin.headers["set-cookie"];

      const approveResponse = await request(app)
        .post("/api/auth/approve-admin") // 오타 수정
        .set("Cookie", superAdminCookies)
        .send({ id: "nonexistent-id" });

      expect(approveResponse.status).toBe(401);
    });

    test("일반 사용자를 관리자로 승인 시도", async () => {
      const superAdmin = await prisma.users.create({
        data: {
          username: "superadmin",
          encryptedPassword: await hashPassword("password123!"),
          name: "슈퍼관리자",
          contact: "01011112222",
          email: "super@test.com",
          role: USER_ROLE.SUPER_ADMIN,
          joinStatus: JOIN_STATUS.APPROVED,
        },
      });

      const user = await prisma.users.create({
        data: {
          username: "normaluser",
          encryptedPassword: await hashPassword("password123!"),
          name: "일반유저",
          contact: "01012345678",
          email: "user@test.com",
          role: USER_ROLE.USER,
          joinStatus: JOIN_STATUS.PENDING,
        },
      });

      const superAdminLogin = await request(app).post("/api/auth/login").send({
        username: "superadmin",
        password: "password123!",
      });
      const superAdminCookies = superAdminLogin.headers["set-cookie"];

      const approveResponse = await request(app)
        .post("/api/auth/approve-admin") // 오타 수정
        .set("Cookie", superAdminCookies)
        .send({ id: user.id });

      expect(approveResponse.status).toBe(401);
    });

    test("존재하지 않는 사용자 승인 시도", async () => {
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
              username: "admin",
              encryptedPassword: await hashPassword("password123!"),
              name: "관리자",
              contact: "01099999999",
              email: "admin@apartment.com",
              role: USER_ROLE.ADMIN,
              joinStatus: JOIN_STATUS.APPROVED,
            },
          },
        },
      });

      const adminLogin = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "password123!",
      });
      const adminCookies = adminLogin.headers["set-cookie"];

      const approveResponse = await request(app)
        .post("/api/auth/approve-user/nonexistent-id")
        .set("Cookie", adminCookies);

      expect(approveResponse.status).toBe(401);
    });

    test("관리자를 사용자로 승인 시도", async () => {
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
              username: "admin",
              encryptedPassword: await hashPassword("password123!"),
              name: "관리자",
              contact: "01099999999",
              email: "admin@apartment.com",
              role: USER_ROLE.ADMIN,
              joinStatus: JOIN_STATUS.APPROVED,
            },
          },
        },
      });

      const admin2 = await prisma.users.create({
        data: {
          username: "admin2",
          encryptedPassword: await hashPassword("password123!"),
          name: "관리자2",
          contact: "01011111111",
          email: "admin2@test.com",
          role: USER_ROLE.ADMIN,
          joinStatus: JOIN_STATUS.PENDING,
        },
      });

      const adminLogin = await request(app).post("/api/auth/login").send({
        username: "admin",
        password: "password123!",
      });
      const adminCookies = adminLogin.headers["set-cookie"];

      const approveResponse = await request(app)
        .post(`/api/auth/approve-user/${admin2.id}`)
        .set("Cookie", adminCookies);

      expect(approveResponse.status).toBe(401);
    });
  });
});
