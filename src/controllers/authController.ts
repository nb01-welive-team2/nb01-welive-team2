import { Request, Response } from "express";
import * as authService from "../services/authService";
import { clearTokenCookies, setTokenCookies } from "../lib/utils/auth";
import { REFRESH_TOKEN_COOKIE_NAME } from "../lib/constance";
import {
  loginBodyStruct,
  UpdatePasswordBodyStruct,
} from "../structs/userStruct";
import { create } from "superstruct";
import { AuthenticatedRequest } from "@/types/express";
import { loginResponseDTO } from "@/dto/userDTO";

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: "[모든 사용자] 로그인"
 *     description: |
 *       사용자 아이디(username)와 비밀번호로 로그인합니다.<br>
 *       성공 시 **Access Token**과 **Refresh Token**이 *쿠키*로 설정되며, 사용자 정보(JSON)가 응답 본문으로 반환됩니다.<br>
 *       Refresh 토큰은 HttpOnly / Secure 쿠키 사용을 권장합니다.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequestDTO'
 *           example:
 *             username: testuser
 *             password: "password1234!"
 *     responses:
 *       200:
 *         description: 로그인이 완료되었습니다.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: Access/Refresh 토큰 쿠키.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponseDTO'
 *             example:
 *               id: "c55f1c1a-6e3c-4e34-a1fd-0c7c4e6cd001"
 *               name: "김코딧"
 *               email: "testuser-mail@example.com"
 *               role: "USER"
 *               username: "testuser"
 *               contact: "01012345678"
 *               avatar: "https://example.com/avatar.jpg"
 *               joinStatus: "APPROVED"
 *               isActive: true
 *               apartmentId: "af2b0b36-4c10-4d5d-8c5e-442f2e1d0001"
 *               apartmentName: "햇살아파트"
 *               residentDong: "1"
 *       400:
 *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "잘못된 요청 본문입니다. username 또는 password 형식이 유효하지 않습니다."
 *       401:
 *         description: 인증 실패. 아이디 또는 비밀번호가 일치하지 않습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "로그인 실패"
 *       403:
 *         description: 접근 권한이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "접근 권한이 없습니다."
 *       404:
 *         description: 사용자를 찾을 수 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "사용자를 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "서버 오류가 발생했습니다."
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const data = create(req.body, loginBodyStruct);
  const { accessToken, refreshToken, user } = await authService.login(data);
  setTokenCookies(res, accessToken, refreshToken);

  res.status(200).json(new loginResponseDTO(user));
};

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: "[모든 사용자] 로그아웃"
 *     description: |
 *       현재 세션을 종료합니다.<br>
 *       서버는 클라이언트에서 전달된 **Refresh Token(쿠키)** 및 **Access Token(Authorization 헤더)** 를 무효화(블랙리스트/삭제) 시도합니다.
 *     tags:
 *       - Auth
 *     security: []  # 인증 강제 없음 (쿠키/헤더 기반 자율 전달)
 *     responses:
 *       200:
 *         description: 로그아웃이 완료되었습니다.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: 만료 처리된 Refresh/Access 토큰 쿠키.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그아웃이 완료되었습니다."
 *       400:
 *         description: 잘못된 요청 형식(일반적으로 발생하지 않음; 내부 검증 실패 시).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "잘못된 요청입니다."
 *       401:
 *         description: 로그아웃 중 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "로그아웃 중 오류가 발생했습니다."
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "서버 오류가 발생했습니다."
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(" ")[1];

  await authService.logout(refreshToken, accessToken);

  clearTokenCookies(res);
  res.status(200).json({ message: "로그아웃이 완료되었습니다." });
};

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: "[모든 사용자] 토큰 갱신 (Access / Refresh 재발급)"
 *     description: |
 *       만료되었거나 곧 만료될 수 있는 Access Token을 갱신하기 위해 Refresh Token을 사용합니다.<br>
 *       클라이언트는 **Refresh Token이 저장된 쿠키**를 함께 전송해야 하며, 서버는 새 Access/Refresh 토큰을 다시 쿠키로 설정합니다.<br>
 *       토큰을 갱신하면 이전 토큰으로 토큰 갱신을 요청할 수 없습니다. 만약 잘못된 토큰으로 갱신을 요청할 경우, 해당 사용자의 토큰은 모두 삭제됩니다.
 *     tags:
 *       - Auth
 *     security: []  # 글로벌 bearerAuth 무시 (쿠키 기반 호출 허용)
 *     parameters:
 *       - in: cookie
 *         name: refresh-token
 *         required: true
 *         schema:
 *           type: string
 *         description: 서버가 로그인 시 설정한 Refresh Token.
 *     responses:
 *       200:
 *         description: 토큰 갱신이 완료되었습니다.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: 새로 발급된 Access/Refresh 토큰 쿠키.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "토큰 갱신이 완료되었습니다."
 *       400:
 *         description: 잘못된 요청 형식.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "잘못된 요청입니다."
 *       401:
 *         description: 토큰 갱신 중 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "토큰 갱신 중 오류가 발생했습니다."
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "서버 오류가 발생했습니다."
 */
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const getRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshToken(getRefreshToken);
  setTokenCookies(res, accessToken, newRefreshToken);

  res.status(200).json({ message: "토큰 갱신이 완료되었습니다." });
};

/**
 * @openapi
 * /api/users/password:
 *   patch:
 *     summary: 비밀번호 변경
 *     description: |
 *       현재 비밀번호를 검증한 뒤 새 비밀번호로 변경합니다.<br>
 *       비밀번호 변경 후에는 기존 refresh token이 더 이상 유효하지 않으므로 **다시 로그인**해야 합니다.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePasswordDTO'
 *           example:
 *             currentPassword: "password1234!"
 *             newPassword: "newpassword1234!"
 *     responses:
 *       200:
 *         description: 비밀번호 변경 완료. 재 로그인 필요.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "비밀번호가 변경되었습니다. 다시 로그인해주세요."
 *       400:
 *         description: 비밀번호 변경 실패.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "비밀번호 형식이 올바르지 않습니다."
 *       401:
 *         description: 인증 실패(토큰 없음/만료) 또는 현재 비밀번호 불일치 시 반환될 수 있습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "비밀번호를 변경할 권한이 없습니다."
 *       500:
 *         description: 서버 오류.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "서버 오류가 발생했습니다."
 */
export const updatePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { currentPassword, newPassword } = create(
    req.body,
    UpdatePasswordBodyStruct
  );
  const request = req as AuthenticatedRequest;
  const userId = request.user.userId;
  await authService.updatePassword(userId, currentPassword, newPassword);

  res
    .status(200)
    .json({ message: "비밀번호가 변경되었습니다. 다시 로그인해주세요." });
};
