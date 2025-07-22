// import swaggerJSDoc from "swagger-jsdoc";
// import { REDIRECT_PORT, SERVER_URL } from "./lib/constance";

// const swaggerDefinition = {
//   openapi: "3.0.1",
//   info: {
//     title: "panda market", // API 이름
//     version: "1.0.0",
//     description: "자동 생성된 Swagger 문서입니다.", // API 설명
//   },
//   servers: [
//     {
//       url: `http://${SERVER_URL}:${REDIRECT_PORT || 3000}`, // 서버 URL
//     },
//   ],
//   security: [
//     {
//       bearerAuth: [],
//     },
//   ],
//   components: {
//     securitySchemes: {
//       bearerAuth: {
//         type: "http",
//         scheme: "bearer",
//         bearerFormat: "JWT",
//       },
//     },
//     schemas: {
//       Article: {
//         type: "object",
//         properties: {
//           id: { type: "number" },
//           image: { type: "string", nullable: true },
//           createdAt: { type: "string", format: "date-time" },
//           updatedAt: { type: "string", format: "date-time" },
//           title: { type: "string" },
//           content: { type: "string" },
//           userId: { type: "number" },
//         },
//       },
//       Product: {
//         type: "object",
//         properties: {
//           id: { type: "number" },
//           name: { type: "string" },
//           description: { type: "string" },
//           price: { type: "number" },
//           tags: {
//             type: "array",
//             items: { type: "string" },
//           },
//           images: {
//             type: "array",
//             items: { type: "string" },
//           },
//           createdAt: { type: "string", format: "date-time" },
//           updatedAt: { type: "string", format: "date-time" },
//           userId: { type: "number" },
//         },
//       },
//       User: {
//         type: "object",
//         properties: {
//           id: { type: "number" },
//           email: { type: "string", format: "email" },
//           nickname: { type: "string" },
//           image: { type: "string", nullable: true },
//           createdAt: { type: "string", format: "date-time" },
//           updatedAt: { type: "string", format: "date-time" },
//         },
//       },
//       Comment: {
//         type: "object",
//         properties: {
//           id: { type: "number" },
//           createdAt: { type: "string", format: "date-time" },
//           updatedAt: { type: "string", format: "date-time" },
//           content: { type: "string" },
//           userId: { type: "number" },
//           articleId: { type: "number", nullable: true },
//           productId: { type: "number", nullable: true },
//         },
//       },
//       Notification: {
//         type: "object",
//         properties: {
//           id: { type: "number" },
//           userId: { type: "number" },
//           payload: {
//             type: "object",
//             additionalProperties: true,
//           },
//           type: {
//             type: "string",
//             enum: ["NEW_COMMENT", "PRICE_CHANGE"],
//           },
//           createdAt: { type: "string", format: "date-time" },
//           read: { type: "boolean" },
//         },
//       },
//       ArticleWithLikeDTO: {
//         type: "object",
//         properties: {
//           id: { type: "number" },
//           image: { type: "string", nullable: true },
//           createdAt: { type: "string", format: "date-time" },
//           updatedAt: { type: "string", format: "date-time" },
//           title: { type: "string" },
//           content: { type: "string" },
//           userId: { type: "number" },
//           isLiked: { type: "boolean" },
//         },
//       },
//       ArticleListWithCountDTO: {
//         type: "object",
//         properties: {
//           list: {
//             type: "array",
//             items: { $ref: "#/components/schemas/ArticleWithLikeDTO" },
//           },
//           totalCount: { type: "number" },
//         },
//       },
//       CreateCommentDTO: {
//         type: "object",
//         properties: {
//           articleId: { type: "number", nullable: true },
//           productId: { type: "number", nullable: true },
//           content: { type: "string" },
//           userId: { type: "number" },
//         },
//         required: ["content", "userId"],
//       },

//       CommentListItemDTO: {
//         type: "object",
//         properties: {
//           id: { type: "number" },
//           createdAt: { type: "string", format: "date-time" },
//           updatedAt: { type: "string", format: "date-time" },
//           content: { type: "string" },
//           userId: { type: "number" },
//           articleId: { type: "number", nullable: true },
//           productId: { type: "number", nullable: true },
//         },
//       },

//       CommentListWithCursorDTO: {
//         type: "object",
//         properties: {
//           list: {
//             type: "array",
//             items: { $ref: "#/components/schemas/CommentListItemDTO" },
//           },
//           nextCursor: { type: "number", nullable: true },
//         },
//       },
//       CreateNotificationDTO: {
//         type: "object",
//         properties: {
//           userId: { type: "number" },
//           payload: {
//             type: "object",
//             properties: {
//               message: { type: "string" },
//             },
//           },
//           type: {
//             type: "string",
//             enum: ["NEW_COMMENT", "PRICE_CHANGE"],
//           },
//         },
//         required: ["userId", "type", "payload"],
//       },

//       AlertNotificationDTO: {
//         type: "object",
//         properties: {
//           userId: { type: "number" },
//           payload: { type: "object", additionalProperties: true },
//           type: {
//             type: "string",
//             enum: ["NEW_COMMENT", "PRICE_CHANGE"],
//           },
//           createAt: { type: "string", format: "date-time" },
//           read: { type: "boolean" },
//         },
//         required: ["userId", "payload", "type", "createAt", "read"],
//       },
//       ProductWithLikeDTO: {
//         type: "object",
//         properties: {
//           id: { type: "number" },
//           name: { type: "string" },
//           description: { type: "string" },
//           price: { type: "number" },
//           tags: {
//             type: "array",
//             items: { type: "string" },
//           },
//           images: {
//             type: "array",
//             items: { type: "string" },
//           },
//           createdAt: { type: "string", format: "date-time" },
//           updatedAt: { type: "string", format: "date-time" },
//           userId: { type: "number" },
//           isLiked: { type: "boolean" },
//         },
//         required: [
//           "id",
//           "name",
//           "description",
//           "price",
//           "tags",
//           "images",
//           "createdAt",
//           "updatedAt",
//           "userId",
//           "isLiked",
//         ],
//       },

//       ProductListWithCountDTO: {
//         type: "object",
//         properties: {
//           list: {
//             type: "array",
//             items: {
//               type: "object",
//               properties: {
//                 id: { type: "number" },
//                 name: { type: "string" },
//                 description: { type: "string" },
//                 price: { type: "number" },
//                 tags: {
//                   type: "array",
//                   items: { type: "string" },
//                 },
//                 images: {
//                   type: "array",
//                   items: { type: "string" },
//                 },
//                 createdAt: { type: "string", format: "date-time" },
//                 updatedAt: { type: "string", format: "date-time" },
//                 userId: { type: "number" },
//               },
//               required: [
//                 "id",
//                 "name",
//                 "description",
//                 "price",
//                 "tags",
//                 "images",
//                 "createdAt",
//                 "updatedAt",
//                 "userId",
//               ],
//             },
//           },
//           totalCount: { type: "number" },
//         },
//         required: ["list", "totalCount"],
//       },
//     },
//   },
// };

// const options = {
//   swaggerDefinition,
//   apis: ["src/controllers/*.ts"], // 주석 작성 위치
// };

// const swaggerSpec = swaggerJSDoc(options);

// export default swaggerSpec;

import swaggerJSDoc from "swagger-jsdoc";
import { REDIRECT_PORT, SERVER_URL } from "./lib/constance";

/**
 * 공통 Enum 헬퍼: 문자열 enum을 OpenAPI enum 배열로 쉽게 재사용하려면
 * 타입스크립트 enum에서 가져오기보단 직접 배열 선언이 가장 단순합니다.
 */
const USER_ROLE_ENUM = ["SUPER_ADMIN", "ADMIN", "USER"] as const;
const JOIN_STATUS_ENUM = ["APPROVED", "REJECTED", "PENDING"] as const;
const APPROVAL_STATUS_ENUM = ["APPROVED", "REJECTED", "PENDING"] as const;
const COMPLAINT_STATUS_ENUM = ["PENDING", "IN_PROGRESS", "CLOSED"] as const;
const POLL_STATUS_ENUM = ["PENDING", "IN_PROGRESS", "CLOSED"] as const;
const NOTICE_CATEGORY_ENUM = [
  "MAINTENANCE",
  "EMERGENCY",
  "COMMUNITY",
  "RESIDENT_VOTE",
  "ETC",
] as const;
/**
 * NOTE: 현재 NOTIFICATION_TYPE에는 한글 enum이 섞여 있음.
 * 실제 API 응답/요청에서 어떤 문자열을 쓰는지 확정 후 수정하세요.
 */
const NOTIFICATION_TYPE_ENUM = [
  "COMPLAINT_RESOLVED",
  "민원_등록",
  "공지_등록",
  "회원가입신청",
] as const;

const swaggerDefinition = {
  openapi: "3.0.1",
  info: {
    title: "Apartment Community API",
    version: "1.0.0",
    description: "위리브 API 명세서",
  },
  servers: [
    {
      url: `http://${SERVER_URL}:${REDIRECT_PORT || 3000}`,
      description: "기본 API 서버",
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      // -------------------------
      // 🔐 Auth 관련 DTO
      // -------------------------
      LoginRequestDTO: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: {
            type: "string",
            minLength: 1,
            maxLength: 20,
            description: "로그인 아이디(username).",
            example: "minsoo01",
          },
          password: {
            type: "string",
            minLength: 8,
            maxLength: 128,
            description: "사용자 비밀번호.",
            example: "P@ssw0rd123!",
          },
        },
      },

      LoginResponseDTO: {
        type: "object",
        description:
          "로그인 성공 시 반환되는 사용자 프로필. 역할(role)에 따라 포함 필드가 달라질 수 있습니다.",
        required: [
          "id",
          "name",
          "email",
          "role",
          "username",
          "contact",
          "joinStatus",
          "isActive",
        ],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "사용자 UUID.",
            example: "c55f1c1a-6e3c-4e34-a1fd-0c7c4e6cd001",
          },
          name: {
            type: "string",
            description: "사용자 이름.",
            example: "신민수",
          },
          email: {
            type: "string",
            format: "email",
            example: "minsoo@example.com",
          },
          role: {
            type: "string",
            description: "사용자 권한.",
            enum: [...USER_ROLE_ENUM],
            example: "USER",
          },
          username: {
            type: "string",
            description: "로그인에 사용하는 사용자명.",
            example: "minsoo01",
          },
          contact: {
            type: "string",
            description: "연락처(휴대전화). 패턴: ^010\\d{8}$.",
            example: "01012345678",
          },
          avatar: {
            type: "string",
            nullable: true,
            description: "프로필 이미지 URL.",
            example: "https://cdn.example.com/avatar/minsoo01.png",
          },
          joinStatus: {
            type: "string",
            enum: [...JOIN_STATUS_ENUM],
            description: "가입 승인 상태.",
            example: "APPROVED",
          },
          isActive: {
            type: "boolean",
            description: "활성 사용자 여부.",
            example: true,
          },
          apartmentId: {
            type: "string",
            format: "uuid",
            nullable: true,
            description: "사용자가 속한 아파트 ID (USER 또는 ADMIN에서 존재).",
            example: "af2b0b36-4c10-4d5d-8c5e-442f2e1d0001",
          },
          apartmentName: {
            type: "string",
            nullable: true,
            description: "아파트 이름.",
            example: "햇살아파트",
          },
          residentDong: {
            type: "integer",
            nullable: true,
            description: "입주민 동 번호.",
            example: 101,
          },
        },
      },

      UpdatePasswordDTO: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: {
            type: "string",
            minLength: 8,
            maxLength: 128,
            description: "현재 비밀번호.",
            example: "OldP@ssw0rd!",
          },
          newPassword: {
            type: "string",
            minLength: 8,
            maxLength: 128,
            description: "새 비밀번호. 강력한 조합 추천.",
            example: "N3wStrongerP@ss!",
          },
        },
      },

      SignupUserRequestDTO: {
        type: "object",
        required: [
          "username",
          "password",
          "contact",
          "name",
          "email",
          "role",
          "apartmentName",
          "apartmentDong",
          "apartmentHo",
        ],
        properties: {
          username: {
            type: "string",
            minLength: 5,
            maxLength: 30,
            description: "로그인 아이디. 고유값.",
            example: "resident10101",
          },
          password: {
            type: "string",
            minLength: 8,
            maxLength: 128,
            description: "비밀번호 (8~128자).",
            example: "R3sident!234",
          },
          contact: {
            type: "string",
            description: "휴대전화. 패턴 ^010\\d{8}$.",
            example: "01012345678",
          },
          name: {
            type: "string",
            description: "사용자 이름.",
            example: "홍길동",
          },
          email: {
            type: "string",
            format: "email",
            description: "사용자 이메일. 고유값.",
            example: "hong@example.com",
          },
          role: {
            type: "string",
            enum: ["USER"],
            description: "가입 유형(입주민). 반드시 USER.",
            example: "USER",
          },
          profileImage: {
            type: "string",
            nullable: true,
            description: "선택: 프로필 이미지 URL.",
            example: "https://cdn.example.com/avatar/hong.png",
          },
          apartmentName: {
            type: "string",
            description: "아파트 이름.",
            example: "햇살아파트",
          },
          apartmentDong: {
            type: "integer",
            description: "동 번호. 문자열 입력 시 서버에서 숫자로 변환.",
            example: 101,
          },
          apartmentHo: {
            type: "integer",
            description: "호수. 문자열 입력 시 서버에서 숫자로 변환.",
            example: 1001,
          },
        },
      },

      SignupResponseDTO: {
        type: "object",
        description:
          "회원가입 요청 생성 후 반환되는 최소 사용자 정보. 관리자 승인 전 상태일 수 있습니다.",
        required: ["id", "name", "role", "email", "joinStatus", "isActive"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "생성된 사용자 ID.",
            example: "8f0acaa2-ae50-48a3-9e6f-5b6a6d9c0001",
          },
          name: {
            type: "string",
            description: "사용자 이름.",
            example: "홍길동",
          },
          role: {
            type: "string",
            enum: ["USER", "ADMIN", "SUPER_ADMIN"],
            description: "생성된 계정 권한.",
            example: "USER",
          },
          email: {
            type: "string",
            format: "email",
            example: "hong@example.com",
          },
          joinStatus: {
            type: "string",
            enum: ["APPROVED", "REJECTED", "PENDING"],
            description: "가입 승인 상태. 일반적으로 PENDING으로 시작.",
            example: "PENDING",
          },
          isActive: {
            type: "boolean",
            description:
              "활성 사용자 플래그. 초기 true로 설정됨(정책에 따라 변경).",
            example: true,
          },
        },
      },

      SignupAdminRequestDTO: {
        type: "object",
        required: [
          "username",
          "password",
          "contact",
          "name",
          "email",
          "role",
          "apartmentName",
          "apartmentAddress",
          "apartmentManagementNumber",
          "description",
          "startComplexNumber",
          "endComplexNumber",
          "startDongNumber",
          "endDongNumber",
          "startFloorNumber",
          "endFloorNumber",
          "startHoNumber",
          "endHoNumber",
        ],
        properties: {
          username: {
            type: "string",
            minLength: 5,
            maxLength: 30,
            example: "hatsal-admin",
          },
          password: {
            type: "string",
            minLength: 8,
            maxLength: 128,
            example: "Adm!nStr0ng!",
          },
          contact: {
            type: "string",
            description: "휴대전화 ^010\\d{8}$",
            example: "01099998888",
          },
          name: { type: "string", example: "관리자 김아파트" },
          email: {
            type: "string",
            format: "email",
            example: "admin@hatsalapt.com",
          },
          role: { type: "string", enum: ["ADMIN"], example: "ADMIN" },
          profileImage: {
            type: "string",
            nullable: true,
            example: "https://cdn.example.com/avatar/admin.png",
          },
          apartmentName: { type: "string", example: "햇살아파트" },
          apartmentAddress: {
            type: "string",
            example: "서울시 강남구 역삼동 123-45",
          },
          apartmentManagementNumber: {
            type: "string",
            description: "단지 관리번호/대표 번호(예: 02-123-4567).",
            example: "02-123-4567",
          },
          description: {
            type: "string",
            example: "햇살아파트 단지 관리자 계정입니다.",
          },
          startComplexNumber: { type: "integer", example: 1 },
          endComplexNumber: { type: "integer", example: 10 },
          startDongNumber: { type: "integer", example: 101 },
          endDongNumber: { type: "integer", example: 120 },
          startFloorNumber: { type: "integer", example: 1 },
          endFloorNumber: { type: "integer", example: 25 },
          startHoNumber: { type: "integer", example: 101 },
          endHoNumber: { type: "integer", example: 2501 },
        },
      },

      SignupSuperAdminRequestDTO: {
        type: "object",
        required: [
          "username",
          "password",
          "contact",
          "name",
          "email",
          "role",
          "joinStatus",
        ],
        properties: {
          username: {
            type: "string",
            minLength: 5,
            maxLength: 30,
            description: "로그인 아이디(고유).",
            example: "rootmaster",
          },
          password: {
            type: "string",
            minLength: 8,
            maxLength: 128,
            description: "최고관리자 계정 비밀번호.",
            example: "Sup3rAdm!nPass",
          },
          contact: {
            type: "string",
            description: "휴대전화. 패턴 ^010\\d{8}$.",
            example: "01011112222",
          },
          name: {
            type: "string",
            description: "계정 표시용 이름.",
            example: "플랫폼 최고관리자",
          },
          email: {
            type: "string",
            format: "email",
            description: "최고관리자 이메일.",
            example: "root@platform.local",
          },
          role: {
            type: "string",
            enum: ["SUPER_ADMIN"],
            description: "계정 유형. 반드시 SUPER_ADMIN.",
            example: "SUPER_ADMIN",
          },
          profileImage: {
            type: "string",
            nullable: true,
            description: "선택: 프로필 이미지 URL.",
            example: "https://cdn.example.com/avatar/root.png",
          },
          joinStatus: {
            type: "string",
            enum: ["APPROVED"],
            description: "최고관리자 계정은 즉시 승인 상태로 생성됩니다.",
            example: "APPROVED",
          },
        },
      },

      UpdateAdminDTO: {
        type: "object",
        description:
          "SUPER_ADMIN이 단지 관리자 계정 및 단지 기본 정보를 수정할 때 사용하는 요청 DTO.",
        required: [
          "id",
          "contact",
          "name",
          "email",
          "description",
          "apartmentName",
          "apartmentAddress",
          "apartmentManagementNumber",
        ],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "수정 대상 관리자(User) ID.",
            example: "e1b34cd2-7390-4d7e-a1b2-77d4a3ff0001",
          },
          contact: {
            type: "string",
            description: "휴대전화. 패턴 ^010\\d{8}$.",
            example: "01098765432",
          },
          name: {
            type: "string",
            description: "관리자 이름.",
            example: "관리자 김아파트",
          },
          email: {
            type: "string",
            format: "email",
            description: "관리자 이메일.",
            example: "admin_updated@hatsalapt.com",
          },
          description: {
            type: "string",
            description: "단지 설명 또는 관리 메모.",
            example: "연락처 및 주소 정보 수정",
          },
          apartmentName: {
            type: "string",
            description: "단지 이름.",
            example: "햇살아파트 리뉴얼",
          },
          apartmentAddress: {
            type: "string",
            description: "단지 주소.",
            example: "서울시 강남구 리뉴얼로 456",
          },
          apartmentManagementNumber: {
            type: "string",
            description: "단지 관리번호/대표 전화번호. 예: 02-987-6543",
            example: "02-987-6543",
          },
        },
      },

      UpdateUserDTO: {
        type: "object",
        description:
          "내 계정 업데이트 요청 DTO. 아무 필드도 보내지 않으면 변경 없음. 비밀번호 변경 시 current/new 둘 다 필요.",
        properties: {
          currentPassword: {
            type: "string",
            nullable: true,
            minLength: 8,
            maxLength: 128,
            description: "현재 비밀번호. 새 비밀번호 변경 시 필수.",
            example: "OldP@ssw0rd!",
          },
          newPassword: {
            type: "string",
            nullable: true,
            minLength: 8,
            maxLength: 128,
            description: "새 비밀번호. currentPassword와 함께 전달해야 적용.",
            example: "N3wP@ssw0rd!!",
          },
          profileImage: {
            type: "string",
            nullable: true,
            description: "새 프로필 이미지 URL.",
            example: "https://cdn.example.com/avatar/me.png",
          },
        },
        anyOf: [
          { required: ["profileImage"] },
          { required: ["currentPassword", "newPassword"] },
        ],
      },

      ApproveAdminRequestDTO: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "승인 대상 관리자(User) ID.",
            example: "e1b34cd2-7390-4d7e-a1b2-77d4a3ff0001",
          },
        },
      },

      RejectAdminRequestDTO: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "거절 대상 관리자(User) ID.",
            example: "e1b34cd2-7390-4d7e-a1b2-77d4a3ff0001",
          },
        },
      },

      UploadAvatarResponseDTO: {
        type: "object",
        required: ["url", "message"],
        properties: {
          url: {
            type: "string",
            format: "uri",
            description:
              "업로드된 아바타 이미지의 접근 URL (S3 또는 로컬 정적 경로).",
            example:
              "https://s3.ap-northeast-2.amazonaws.com/my-bucket/uploads/avatars/user-123.png",
          },
          message: {
            type: "string",
            description: "업로드 처리 결과 메시지.",
            example: "아바타가 성공적으로 업데이트되었습니다.",
          },
        },
      },

      // -------------------------
      // 📚 Enum 스키마
      // (필요하면 API 응답 DTO에서 $ref로 사용)
      // -------------------------
      USER_ROLE: {
        type: "string",
        enum: [...USER_ROLE_ENUM],
        description: "사용자 권한 등급.",
      },
      JOIN_STATUS: {
        type: "string",
        enum: [...JOIN_STATUS_ENUM],
        description: "가입 상태.",
      },
      APPROVAL_STATUS: {
        type: "string",
        enum: [...APPROVAL_STATUS_ENUM],
        description: "승인 상태.",
      },
      COMPLAINT_STATUS: {
        type: "string",
        enum: [...COMPLAINT_STATUS_ENUM],
        description: "민원 처리 상태.",
      },
      POLL_STATUS: {
        type: "string",
        enum: [...POLL_STATUS_ENUM],
        description: "투표 상태.",
      },
      NOTICE_CATEGORY: {
        type: "string",
        enum: [...NOTICE_CATEGORY_ENUM],
        description: "공지 카테고리.",
      },
      NOTIFICATION_TYPE: {
        type: "string",
        enum: [...NOTIFICATION_TYPE_ENUM],
        description:
          "알림 유형. ⚠️ 한글 enum 값은 프론트 협의 후 변경될 수 있습니다.",
      },

      // -------------------------
      // ✅ 공통 에러 응답 (필요 시 재사용)
      // -------------------------
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "에러 메시지" },
          code: {
            type: "string",
            nullable: true,
            description: "선택적 에러 코드 문자열.",
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["src/**/*.ts"], // JSDoc @openapi 블록 위치: 컨트롤러/라우터 전역 스캔
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
