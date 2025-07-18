import { Request, Response } from "express";
import { uploadBufferToS3 } from "../services/imageService";
import path from "path";
import BadRequestError from "@/errors/BadRequestError";
import { NODE_ENV, STATIC_PATH } from "@/lib/constance";

/**
 * @openapi
 * /api/users/avatar:
 *   patch:
 *     summary: 프로필 아바타 변경
 *     description: |
 *       인증된 사용자의 **프로필 아바타 이미지를 업로드**합니다.
 *
 *       ### 업로드 동작
 *       - **프로덕션(`NODE_ENV=production`)**: 업로드된 파일 버퍼를 S3에 저장하고 S3 퍼블릭 URL을 반환합니다.
 *       - **개발/로컬 환경**: 서버의 정적 경로(`STATIC_PATH`) 아래 저장 후 호스트 기준의 테스트용 URL을 반환합니다.
 *
 *       ### 요청 조건
 *       - `multipart/form-data` 업로드.
 *       - 필드명: **`image`** (라우터 `uploader.single("image")` 기준).
 *       - 이미지 파일이 없으면 400을 반환합니다.
 *
 *       반환된 `url` 값을 사용해 사용자의 `profileImage` 필드를 갱신하거나, 프런트에서 즉시 표시할 수 있습니다.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []   # 로그인 필수
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 아바타 이미지 파일.
 *           examples:
 *             pngUpload:
 *               summary: PNG 이미지 업로드 예
 *               value:
 *                 image: "(binary)"
 *     responses:
 *       200:
 *         description: 아바타 이미지 변경 완료.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadAvatarResponseDTO'
 *             example:
 *               url: "https://s3.ap-northeast-2.amazonaws.com/my-bucket/uploads/avatars/user-123.png"
 *               message: "아바타가 성공적으로 업데이트되었습니다."
 *       400:
 *         description: 아바타 이미지 변경 실패.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "파일이 없습니다."
 *       401:
 *         description: 권한 없음.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "요청할 권한이 필요합니다."
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "서버 오류가 발생했습니다."
 */
export default async function uploadImage(
  req: Request,
  res: Response
): Promise<void> {
  const isProduction = NODE_ENV === "production";

  if (!req.file) {
    res.status(400).json({ message: "파일이 없습니다." });
    return;
  }

  let url: string;

  if (isProduction) {
    const { buffer, originalname, mimetype } = req.file;
    url = await uploadBufferToS3(buffer, originalname, mimetype);
  } else {
    const host = req.get("host");
    if (!host) {
      throw new BadRequestError("Host is required");
    }
    if (!req.file) {
      throw new BadRequestError("File is required");
    }
    const filePath = path.join(host, STATIC_PATH, req.file.filename);
    url = `http://${filePath}`;
  }

  res
    .status(200)
    .json({ url, message: "아바타가 성공적으로 업데이트되었습니다." });
}
