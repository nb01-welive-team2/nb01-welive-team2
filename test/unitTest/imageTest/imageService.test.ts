import { uploadBufferToS3 } from "@/services/imageService";
import { s3Client } from "@/lib/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

jest.mock("@/lib/s3Client");
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-1234"),
}));

describe("imageService", () => {
  const mockS3Client = s3Client as jest.Mocked<typeof s3Client>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadBufferToS3", () => {
    test("S3에 파일 업로드 성공", async () => {
      const mockBuffer = Buffer.from("test-image-data");
      const originalName = "test-image.png";
      const mimetype = "image/png";

      mockS3Client.send = jest.fn().mockResolvedValue({});

      const result = await uploadBufferToS3(mockBuffer, originalName, mimetype);

      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(PutObjectCommand)
      );
      expect(result).toContain("uploads/test-uuid-1234.png");
    });

    test("확장자가 없는 파일 업로드", async () => {
      const mockBuffer = Buffer.from("test-data");
      const originalName = "testfile";
      const mimetype = "image/jpeg";

      mockS3Client.send = jest.fn().mockResolvedValue({});

      const result = await uploadBufferToS3(mockBuffer, originalName, mimetype);

      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(PutObjectCommand)
      );
      expect(result).toContain("uploads/test-uuid-1234");
    });

    test("S3 업로드 실패 시 에러 발생", async () => {
      const mockBuffer = Buffer.from("test-image-data");
      const originalName = "test-image.jpg";
      const mimetype = "image/jpeg";

      const mockError = new Error("S3 upload failed");
      mockS3Client.send = jest.fn().mockRejectedValue(mockError);

      await expect(
        uploadBufferToS3(mockBuffer, originalName, mimetype)
      ).rejects.toThrow("S3 upload failed");

      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(PutObjectCommand)
      );
    });

    test("PutObjectCommand가 올바른 파라미터로 생성됨", async () => {
      const mockBuffer = Buffer.from("test-image-data");
      const originalName = "test-image.png";
      const mimetype = "image/png";

      mockS3Client.send = jest.fn().mockResolvedValue({});

      await uploadBufferToS3(mockBuffer, originalName, mimetype);

      const putObjectCommand = (mockS3Client.send as jest.Mock).mock
        .calls[0][0];
      expect(putObjectCommand.input.Key).toBe("uploads/test-uuid-1234.png");
      expect(putObjectCommand.input.Body).toBe(mockBuffer);
      expect(putObjectCommand.input.ContentType).toBe(mimetype);
    });

    test("다양한 확장자 처리", async () => {
      const testCases = [
        { name: "image.jpg", expected: ".jpg" },
        { name: "photo.jpeg", expected: ".jpeg" },
        { name: "picture.PNG", expected: ".PNG" },
        { name: "file", expected: "" },
      ];

      mockS3Client.send = jest.fn().mockResolvedValue({});

      for (const testCase of testCases) {
        const mockBuffer = Buffer.from("test-data");
        const result = await uploadBufferToS3(
          mockBuffer,
          testCase.name,
          "image/png"
        );

        expect(result).toContain(`uploads/test-uuid-1234${testCase.expected}`);
      }
    });
  });
});
