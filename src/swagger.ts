import swaggerJSDoc from "swagger-jsdoc";
import { REDIRECT_PORT, SERVER_URL } from "./lib/constance";

const swaggerDefinition = {
  openapi: "3.0.1",
  info: {
    title: "panda market", // API 이름
    version: "1.0.0",
    description: "자동 생성된 Swagger 문서입니다.", // API 설명
  },
  servers: [
    {
      url: `http://${SERVER_URL}:${REDIRECT_PORT || 3000}`, // 서버 URL
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
      Article: {
        type: "object",
        properties: {
          id: { type: "number" },
          image: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          title: { type: "string" },
          content: { type: "string" },
          userId: { type: "number" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "number" },
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          tags: {
            type: "array",
            items: { type: "string" },
          },
          images: {
            type: "array",
            items: { type: "string" },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          userId: { type: "number" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "number" },
          email: { type: "string", format: "email" },
          nickname: { type: "string" },
          image: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          content: { type: "string" },
          userId: { type: "number" },
          articleId: { type: "number", nullable: true },
          productId: { type: "number", nullable: true },
        },
      },
      Notification: {
        type: "object",
        properties: {
          id: { type: "number" },
          userId: { type: "number" },
          payload: {
            type: "object",
            additionalProperties: true,
          },
          type: {
            type: "string",
            enum: ["NEW_COMMENT", "PRICE_CHANGE"],
          },
          createdAt: { type: "string", format: "date-time" },
          read: { type: "boolean" },
        },
      },
      ArticleWithLikeDTO: {
        type: "object",
        properties: {
          id: { type: "number" },
          image: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          title: { type: "string" },
          content: { type: "string" },
          userId: { type: "number" },
          isLiked: { type: "boolean" },
        },
      },
      ArticleListWithCountDTO: {
        type: "object",
        properties: {
          list: {
            type: "array",
            items: { $ref: "#/components/schemas/ArticleWithLikeDTO" },
          },
          totalCount: { type: "number" },
        },
      },
      CreateCommentDTO: {
        type: "object",
        properties: {
          articleId: { type: "number", nullable: true },
          productId: { type: "number", nullable: true },
          content: { type: "string" },
          userId: { type: "number" },
        },
        required: ["content", "userId"],
      },

      CommentListItemDTO: {
        type: "object",
        properties: {
          id: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          content: { type: "string" },
          userId: { type: "number" },
          articleId: { type: "number", nullable: true },
          productId: { type: "number", nullable: true },
        },
      },

      CommentListWithCursorDTO: {
        type: "object",
        properties: {
          list: {
            type: "array",
            items: { $ref: "#/components/schemas/CommentListItemDTO" },
          },
          nextCursor: { type: "number", nullable: true },
        },
      },
      CreateNotificationDTO: {
        type: "object",
        properties: {
          userId: { type: "number" },
          payload: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          type: {
            type: "string",
            enum: ["NEW_COMMENT", "PRICE_CHANGE"],
          },
        },
        required: ["userId", "type", "payload"],
      },

      AlertNotificationDTO: {
        type: "object",
        properties: {
          userId: { type: "number" },
          payload: { type: "object", additionalProperties: true },
          type: {
            type: "string",
            enum: ["NEW_COMMENT", "PRICE_CHANGE"],
          },
          createAt: { type: "string", format: "date-time" },
          read: { type: "boolean" },
        },
        required: ["userId", "payload", "type", "createAt", "read"],
      },
      ProductWithLikeDTO: {
        type: "object",
        properties: {
          id: { type: "number" },
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          tags: {
            type: "array",
            items: { type: "string" },
          },
          images: {
            type: "array",
            items: { type: "string" },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          userId: { type: "number" },
          isLiked: { type: "boolean" },
        },
        required: [
          "id",
          "name",
          "description",
          "price",
          "tags",
          "images",
          "createdAt",
          "updatedAt",
          "userId",
          "isLiked",
        ],
      },

      ProductListWithCountDTO: {
        type: "object",
        properties: {
          list: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "number" },
                name: { type: "string" },
                description: { type: "string" },
                price: { type: "number" },
                tags: {
                  type: "array",
                  items: { type: "string" },
                },
                images: {
                  type: "array",
                  items: { type: "string" },
                },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
                userId: { type: "number" },
              },
              required: [
                "id",
                "name",
                "description",
                "price",
                "tags",
                "images",
                "createdAt",
                "updatedAt",
                "userId",
              ],
            },
          },
          totalCount: { type: "number" },
        },
        required: ["list", "totalCount"],
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["src/controllers/*.ts"], // 주석 작성 위치
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
