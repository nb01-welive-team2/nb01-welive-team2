import { Request, Response } from "express";

jest.mock("@/services/imageService");
import uploadImage from "@/controllers/imageController";

describe("imageController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      get: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadImage", () => {
    test("파일이 없을 때 400 에러 반환", async () => {
      req.file = undefined;

      await uploadImage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "파일이 없습니다." });
    });

    test("개발 환경에서 로컬 파일 업로드 성공", async () => {
      req.file = {
        filename: "test-image.png",
        originalname: "original.png",
        mimetype: "image/png",
        buffer: Buffer.from("test"),
      } as Express.Multer.File;
      req.get = jest.fn().mockReturnValue("localhost:3000");

      await uploadImage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        url: "http://localhost:3000/uploads/test-image.png",
        message: "아바타가 성공적으로 업데이트되었습니다.",
      });
    });

    test("개발 환경에서 host가 없을 때 에러 발생", async () => {
      req.file = {
        filename: "test-image.png",
        originalname: "original.png",
        mimetype: "image/png",
        buffer: Buffer.from("test"),
      } as Express.Multer.File;
      req.get = jest.fn().mockReturnValue(undefined);

      await expect(
        uploadImage(req as Request, res as Response)
      ).rejects.toThrow("Host is required");
    });

    test("프로덕션 환경에서 S3 업로드 성공", async () => {
      process.env.NODE_ENV = "production";
      jest.resetModules();

      const { default: uploadImageProd } = await import(
        "@/controllers/imageController"
      );
      const imageServiceMock = await import("@/services/imageService");

      req.file = {
        filename: "test-image.png",
        originalname: "original.png",
        mimetype: "image/png",
        buffer: Buffer.from("test-image-data"),
      } as Express.Multer.File;
      req.get = jest.fn().mockReturnValue("localhost:3000");

      (imageServiceMock.uploadBufferToS3 as jest.Mock).mockResolvedValue(
        "https://bucket.s3.region.amazonaws.com/uploads/uuid.png"
      );

      await uploadImageProd(req as Request, res as Response);

      expect(imageServiceMock.uploadBufferToS3).toHaveBeenCalledWith(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        url: "https://bucket.s3.region.amazonaws.com/uploads/uuid.png",
        message: "아바타가 성공적으로 업데이트되었습니다.",
      });
    });

    test("프로덕션 환경에서 S3 업로드 실패", async () => {
      process.env.NODE_ENV = "production";
      jest.resetModules();

      const { default: uploadImageProd } = await import(
        "@/controllers/imageController"
      );
      const imageServiceMock = await import("@/services/imageService");

      req.file = {
        filename: "test-image.png",
        originalname: "original.png",
        mimetype: "image/png",
        buffer: Buffer.from("test-image-data"),
      } as Express.Multer.File;
      req.get = jest.fn().mockReturnValue("localhost:3000");

      const mockError = new Error("S3 upload failed");
      (imageServiceMock.uploadBufferToS3 as jest.Mock).mockRejectedValue(
        mockError
      );

      await expect(
        uploadImageProd(req as Request, res as Response)
      ).rejects.toThrow("S3 upload failed");
    });
  });
});
