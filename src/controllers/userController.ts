import { Request, Response } from "express";
import * as userService from "@/services/userService";
import { SignupResponseDTO } from "@/dto/userDTO";
import { create } from "superstruct";
import {
  signupAdminStruct,
  signupSuperAdminStruct,
  signupUserStruct,
  updateAdminStruct,
  UpdateUserBodyStruct,
} from "@/structs/userStruct";
import { AuthenticatedRequest } from "@/types/express";

/**
 * @openapi
 * /api/auth/signup/super-admin:
 *   post:
 *     summary: "[슈퍼 관리자] 회원가입"
 *     description: |
 *       슈퍼 관리자(SUPER_ADMIN) 정보를 입력받아 새로운 계정을 생성합니다. 역할에 따라 추가 정보를 입력받을 수 있습니다.
 *     tags:
 *       - Auth
 *     security: []  # 일반 공개 금지 권장. 문서상 인증 비활성 상태로 표시.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupSuperAdminRequestDTO'
 *           example:
 *             username: "testsuperadmin"
 *             password: "password1234!"
 *             contact: "01011223344"
 *             name: "박최고"
 *             email: "root@platform.com"
 *             role: "SUPER_ADMIN"
 *             joinStatus: "APPROVED"
 *     responses:
 *       201:
 *         description: SUPER_ADMIN 계정이 생성되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignupResponseDTO'
 *             example:
 *               id: "f9d2e93f-1df0-4f6b-8c7e-fd2230d00001"
 *               name: "박최고"
 *               role: "SUPER_ADMIN"
 *               email: "root@platform.com"
 *               joinStatus: "APPROVED"
 *               isActive: true
 *       400:
 *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다."
 *       403:
 *         description: 접근 권한이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "접근 권한이 없습니다."
 *       409:
 *         description: 이미 사용 중인 정보(아이디, 이메일, 전화번호)입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "이미 사용 중인 정보입니다."
 *       413:
 *         description: 요청 데이터가 너무 큽니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "요청 데이터가 너무 큽니다."
 *       429:
 *         description: 요청이 너무 많습니다.(비정상적인 요청 또는 봇 행위로 의심됩니다)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "요청이 너무 많습니다.(비정상적인 요청 또는 봇 행위로 의심됩니다)"
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "서버 오류가 발생했습니다."
 */
export const signupSuperAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = create(req.body, signupSuperAdminStruct);
  const user = await userService.signupSuperAdmin(data);

  res.status(201).json(new SignupResponseDTO(user));
};

/**
 * @openapi
 * /api/auth/signup/admin:
 *   post:
 *     summary: "[관리자] 회원가입"
 *     description: |
 *       관리자(ADMIN) 정보를 입력받아 새로운 계정을 생성합니다. 역할에 따라 추가 정보를 입력받을 수 있습니다.<br>
 *       가입 신청은 일반적으로 **SUPER_ADMIN 승인** 후 활성화됩니다.
 *     tags:
 *       - Auth
 *     security: []  # 공개 엔드포인트
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupAdminRequestDTO'
 *           example:
 *             username: "testadmin"
 *             password: "password1234!"
 *             contact: "01099998888"
 *             name: "이관리"
 *             email: "admin@hatsalapt.com"
 *             role: "ADMIN"
 *             apartmentName: "햇살아파트"
 *             apartmentAddress: "서울시 강남구 역삼동 123-45"
 *             apartmentManagementNumber: "021234567"
 *             description: "햇살아파트 아파트 관리자 계정입니다."
 *             startComplexNumber: "1"
 *             endComplexNumber: "10"
 *             startDongNumber: "1"
 *             endDongNumber: "10"
 *             startFloorNumber: "1"
 *             endFloorNumber: "10"
 *             startHoNumber: "1"
 *             endHoNumber: "10"
 *     responses:
 *       201:
 *         description: 관리자 회원가입 신청이 완료되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignupResponseDTO'
 *             example:
 *               id: "e1b34cd2-7390-4d7e-a1b2-77d4a3ff0001"
 *               name: "이관리"
 *               role: "ADMIN"
 *               email: "admin@hatsalapt.com"
 *               joinStatus: "PENDING"
 *               isActive: true
 *       400:
 *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다."
 *       403:
 *         description: 접근 권한이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "접근 권한이 없습니다."
 *       409:
 *         description: 이미 사용 중인 정보(아이디, 이메일, 전화번호)입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "이미 사용 중인 정보입니다."
 *       413:
 *         description: 요청 데이터가 너무 큽니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "요청 데이터가 너무 큽니다."
 *       429:
 *         description: 요청이 너무 많습니다.(비정상적인 요청 또는 봇 행위로 의심됩니다)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "요청이 너무 많습니다.(비정상적인 요청 또는 봇 행위로 의심됩니다)"
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "서버 오류가 발생했습니다."
 */
export const signupAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = create(req.body, signupAdminStruct);
  const fixedData = {
    ...data,
    startComplexNumber: Number(data.startComplexNumber),
    endComplexNumber: Number(data.endComplexNumber),
    startDongNumber: Number(data.startDongNumber),
    endDongNumber: Number(data.endDongNumber),
    startFloorNumber: Number(data.startFloorNumber),
    endFloorNumber: Number(data.endFloorNumber),
    startHoNumber: Number(data.startHoNumber),
    endHoNumber: Number(data.endHoNumber),
  };
  const user = await userService.signupAdmin(fixedData);

  res.status(201).json(new SignupResponseDTO(user));
};

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: "[입주민] 회원가입"
 *     description: |
 *       입주민(USER) 정보를 입력받아 새로운 계정을 생성합니다. 역할에 따라 추가 정보를 입력받을 수 있습니다.<br>
 *       가입 신청이 접수되면 관리자의 승인 절차를 거쳐 최종 활성화됩니다.
 *     tags:
 *       - Auth
 *     security: []  # 공개 엔드포인트 (토큰 필요 없음)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupUserRequestDTO'
 *           example:
 *             username: "testuser"
 *             password: "password1234!"
 *             contact: "01012345678"
 *             name: "김코딧"
 *             email: "testuser-mail@example.com"
 *             role: "USER"
 *             apartmentName: "햇살아파트"
 *             apartmentDong: "1"
 *             apartmentHo: "10"
 *     responses:
 *       201:
 *         description: 회원가입 신청이 완료되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignupResponseDTO'
 *             example:
 *               id: "c55f1c1a-6e3c-4e34-a1fd-0c7c4e6cd001"
 *               name: "김코딧"
 *               role: "USER"
 *               email: "testuser-mail@example.com"
 *               joinStatus: "PENDING"
 *               isActive: true
 *       400:
 *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다."
 *       403:
 *         description: 접근 권한이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "접근 권한이 없습니다."
 *       409:
 *         description: 이미 사용 중인 정보(아이디, 이메일, 전화번호)입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "이미 사용 중인 정보입니다."
 *       413:
 *         description: 요청 데이터가 너무 큽니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "요청 데이터가 너무 큽니다."
 *       429:
 *         description: 요청이 너무 많습니다.(비정상적인 요청 또는 봇 행위로 의심됩니다)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "요청이 너무 많습니다.(비정상적인 요청 또는 봇 행위로 의심됩니다)"
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "서버 오류가 발생했습니다."
 */
export const signupUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = create(req.body, signupUserStruct);
  const fixedData = {
    ...data,
    apartmentDong: Number(data.apartmentDong),
    apartmentHo: Number(data.apartmentHo),
  };
  const user = await userService.signupUser(fixedData);

  res.status(201).json(new SignupResponseDTO(user));
};

/**
 * @openapi
 * /api/users/me:
 *   patch:
 *     summary: 내 계정 정보 수정 (프로필 / 비밀번호)
 *     description: |
 *       로그인한 사용자가 자신의 계정 정보를 수정합니다.<br>
 *       비밀번호 변경시에만 현재 비밀번호와 새 비밀번호를 입력하세요.<br>
 *       비밀번호 없이 프로필 이미지 변경이 가능합니다.<br>
 *       지원 항목:
 *       - **프로필 이미지 변경** (`profileImage`)
 *       - **비밀번호 변경**: `currentPassword` + `newPassword` 동시 전달 시 적용
 *
 *       비밀번호가 변경되면 기존 인증 access/refresh 토큰이 무효화되므로 **다시 로그인**해야 합니다.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDTO'
 *           example:
 *                 currentPassword: "password1234!"
 *                 newPassword: "newpassword1234!"
 *                 profileImage: "https://cdn.example.com/avatar/me2.png"
 *     responses:
 *       200:
 *         description: 내 정보가 수정되었습니다. 변경 내용에 따라 재로그인이 필요할 수 있습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "정보가 성공적으로 업데이트되었습니다. 다시 로그인해주세요."
 *       400:
 *         description: 변경 실패.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "변경할 내용의 형식이 올바르지 않습니다."
 *       401:
 *         description: 인증 실패(토큰 없음/만료) 또는 현재 비밀번호 불일치 시 반환될 수 있습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "내용을 변경할 권한이 없습니다."
 *       403:
 *         description: 접근 권한이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "접근 권한이 없습니다."
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "서버 오류가 발생했습니다."
 */
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = create(req.body, UpdateUserBodyStruct);
  const request = req as AuthenticatedRequest;
  const userId = request.user.userId;
  await userService.updateUser(userId, data);

  res.status(200).json({
    message: "정보가 성공적으로 업데이트되었습니다. 다시 로그인해주세요.",
  });
};

/**
 * @openapi
 * /api/auth/approve-admin:
 *   post:
 *     summary: "[슈퍼 관리자] 관리자 가입 승인(단건)"
 *     description: |
 *       **가입 대기(PENDING) 상태의 아파트 관리자(Admin) 계정을 승인(APPROVED) 상태로 전환**합니다.<br>
 *       이 작업은 **SUPER_ADMIN 권한**이 있어야 수행할 수 있습니다.
 *
 *       요청 본문으로 승인 대상 관리자 `id` 를 전달하세요.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []   # MUST be SUPER_ADMIN
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApproveAdminRequestDTO'
 *           example:
 *             id: "e1b34cd2-7390-4d7e-a1b2-77d4a3ff0001"
 *     responses:
 *       200:
 *         description: 관리자 가입 승인이 완료되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "관리자 가입 승인이 완료되었습니다."
 *       400:
 *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다."
 *       401:
 *         description: 관리자 가입 승인 중 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "관리자 가입 승인 중 오류가 발생했습니다."
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
export const approveAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const loginId = request.user.userId;

  const { id: bodyId } = req.body;

  await userService.approveAdmin(bodyId, loginId);
  res.status(200).json({ message: "관리자 가입 승인이 완료되었습니다." });
};

/**
 * @openapi
 * /api/auth/reject-admin:
 *   post:
 *     summary: "[슈퍼 관리자] 관리자 가입 거절(단건)"
 *     description: |
 *       **가입 대기(PENDING) 상태의 아파트 관리자(Admin) 계정을 거절(REJECTED) 상태로 전환**합니다.<br>
 *       이 작업은 **SUPER_ADMIN 권한**이 있어야 수행할 수 있습니다.
 *
 *       요청 본문으로 거절할 관리자 `id` 를 전달하세요.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []   # MUST be SUPER_ADMIN
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectAdminRequestDTO'
 *           example:
 *             id: "e1b34cd2-7390-4d7e-a1b2-77d4a3ff0001"
 *     responses:
 *       200:
 *         description: 관리자 가입 거절이 완료되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "관리자 가입 거절이 완료되었습니다."
 *       400:
 *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다."
 *       401:
 *         description: 관리자 가입 거절 중 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "관리자 가입 거절 중 오류가 발생했습니다."
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
export const rejectAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const loginId = request.user.userId;

  const { id: bodyId } = req.body;

  await userService.rejectAdmin(bodyId, loginId);
  res.status(200).json({ message: "관리자 가입 거절이 완료되었습니다." });
};

/**
 * @openapi
 * /api/auth/approve-admins:
 *   post:
 *     summary: "[슈퍼 관리자] 관리자 가입 승인(전체)"
 *     description: |
 *       현재 **가입 대기(PENDING)** 상태인 아파트 관리자(Admin)의 신청을 **일괄 승인(APPROVED)** 처리합니다.<br>
 *       이 작업은 **SUPER_ADMIN 권한**만 수행할 수 있습니다.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []   # MUST be SUPER_ADMIN
 *     responses:
 *       200:
 *         description: 모든 가입 대기(PENDING) 상태인 관리자의 신청에 대한 승인(APPROVED) 처리가 완료되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "관리자 가입 전체 승인이 완료되었습니다."
 *       401:
 *         description: 관리자 가입 전체 승인 중 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "관리자 가입 전체 승인 중 오류가 발생했습니다."
 *       403:
 *         description: 접근 권한이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "접근 권한이 없습니다."
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "서버 오류가 발생했습니다."
 */
export const approveAllAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const id = request.user.userId;

  await userService.approveAllAdmins(id);
  res.status(200).json({ message: "관리자 가입 전체 승인이 완료되었습니다." });
};

/**
 * @openapi
 * /api/auth/reject-admins:
 *   post:
 *     summary: "[슈퍼 관리자] 관리자 가입 거절(전체)"
 *     description: |
 *       현재 **가입 대기(PENDING)** 상태인 아파트 관리자(Admin)의 신청을 **일괄 거절(REJECTED)** 처리합니다.<br>
 *       이 작업은 **SUPER_ADMIN 권한**이 있어야 수행할 수 있습니다.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []   # MUST be SUPER_ADMIN
 *     responses:
 *       200:
 *         description: 모든 가입 대기(PENDING) 상태인 관리자 신청에 대한 거절(REJECTED) 처리가 완료되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "관리자 가입 전체 거절이 완료되었습니다."
 *       401:
 *         description: 관리자 가입 전체 거절 중 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "관리자 가입 전체 거절 중 오류가 발생했습니다."
 *       403:
 *         description: 접근 권한이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "접근 권한이 없습니다."
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "서버 오류가 발생했습니다."
 */
export const rejectAllAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const id = request.user.userId;

  await userService.rejectAllAdmins(id);
  res.status(200).json({ message: "관리자 가입 전체 거절이 완료되었습니다." });
};

/**
 * @openapi
 * /api/auth/approve-user/{userId}:
 *   post:
 *     summary: "[관리자] 입주민 가입 요청 승인(단건)"
 *     description: |
 *       해당 **입주민(USER) 가입 신청(PENDING)** 을 승인(APPROVED) 처리합니다.<br>
 *       호출자는 반드시 **ADMIN 권한**이어야 하며, 일반적으로 *자신이 관리하는 아파트 소속 신청건*만 승인할 수 있습니다.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []   # MUST be ADMIN
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 승인할 입주민(User) ID
 *         example: "c55f1c1a-6e3c-4e34-a1fd-0c7c4e6cd001"
 *     responses:
 *       200:
 *         description: 사용자 가입 요청 승인이 성공했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "사용자 가입 요청 승인이 성공했습니다."
 *       400:
 *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다."
 *       401:
 *         description: 입주자 가입 승인 중 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "입주자 가입 승인 중 오류가 발생했습니다."
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
export const approveUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const loginId = request.user.userId;

  const { id: bodyId } = req.params;

  await userService.approveUser(bodyId, loginId);
  res.status(200).json({ message: "사용자 가입 요청 승인이 성공했습니다." });
};

/**
 * @openapi
 * /api/auth/reject-user/{userId}:
 *   post:
 *     summary: "[관리자] 입주민 가입 요청 거절(단건)"
 *     description: |
 *       *해당 **입주민(USER) 가입 신청(PENDING)** 을 거절(REJECTED) 처리합니다.<br>
 *       이 엔드포인트는 **ADMIN 권한**이 필요하며, 일반적으로 *자신이 관리하는 아파트에 속한 신청 건*만 거절할 수 있습니다.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []   # MUST be ADMIN
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 거절할 입주민(User) ID.
 *         example: "c55f1c1a-6e3c-4e34-a1fd-0c7c4e6cd001"
 *     responses:
 *       200:
 *         description: 사용자 가입 요청 거절이 성공했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "사용자 가입 요청 거절이 성공했습니다."
 *       400:
 *         description: 사용자 가입 거절이 실패하였습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "사용자 가입 요청 거절 실패"
 *       401:
 *         description: 입주자 가입 거절 중 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "입주자 가입 거절 중 오류가 발생했습니다."
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
export const rejectUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const loginId = request.user.userId;

  const { id: bodyId } = req.params;

  await userService.rejectUser(bodyId, loginId);
  res.status(200).json({ message: "사용자 가입 요청 거절이 성공했습니다." });
};

/**
 * @openapi
 * /api/auth/approve-users:
 *   post:
 *     summary: "[관리자] 사용자 가입 요청 승인(전체)"
 *     description: |
 *       현재 **가입 대기(PENDING)** 상태인 입주민(USER)의 신청들을 **일괄 승인(APPROVED)** 처리합니다.
 *       호출자는 반드시 **ADMIN 권한**이어야 하며, 일반적으로 *자신이 관리하는 아파트에 속한 신청 건*만 승인됩니다.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []   # MUST be ADMIN
 *     responses:
 *       200:
 *         description: 모든 가입 대기(PENDING) 상태인 입주민의 신청에 대한 승인(APPROVED) 처리가 완료되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "사용자 가입 요청 전체 승인이 성공했습니다."
 *       401:
 *         description: 사용자 가입 요청 승인(전체) 중 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "사용자 가입 요청 승인(전체) 중 오류가 발생했습니다."
 *       403:
 *         description: 접근 권한이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "접근 권한이 없습니다."
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "서버 오류가 발생했습니다."
 */
export const approveAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const id = request.user.userId;

  await userService.approveAllUsers(id);
  res
    .status(200)
    .json({ message: "사용자 가입 요청 전체 승인이 성공했습니다." });
};

/**
 * @openapi
 * /api/auth/reject-users:
 *   post:
 *     summary: "[관리자] 사용자 가입 요청 거절(전체)"
 *     description: |
 *       현재 **가입 대기(PENDING)** 상태인 입주민(USER)의 신청들을 **일괄 거절(REJECTED)** 처리합니다.
 *       호출자는 반드시 **ADMIN 권한**이어야 하며, 일반적으로 *자신이 관리하는 아파트 소속 신청 건*만 처리됩니다.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []   # MUST be ADMIN
 *     responses:
 *       200:
 *         description: 모든 가입 대기(PENDING) 상태인 입주민의 신청에 대한 거절(REJECTED) 처리가 완료되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "사용자 가입 요청 전체 거절이 성공했습니다."
 *       401:
 *         description: 사용자 가입 요청 거절(전체) 중 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "사용자 가입 요청 거절(전체) 중 오류가 발생했습니다."
 *       403:
 *         description: 접근 권한이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "접근 권한이 없습니다."
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "서버 오류가 발생했습니다."
 */
export const rejectAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const id = request.user.userId;

  await userService.rejectAllUsers(id);
  res
    .status(200)
    .json({ message: "사용자 가입 요청 전체 거절이 성공했습니다." });
};

/**
 * @openapi
 * /api/auth/update-admin:
 *   patch:
 *     summary: "[슈퍼 관리자] 관리자 정보(아파트 정보) 수정"
 *     description: |
 *       **SUPER_ADMIN** 권한 사용자가 기존 관리자(Admin) 계정과 그에 연결된 아파트 기본 정보를 수정합니다.<br>
 *       대상 관리자는 요청 본문에 전달된 `id` 로 식별합니다.
 *
 *       ### 수정 가능 항목
 *       - 관리자 기본 정보: 연락처, 이름, 이메일
 *       - 아파트 정보: 이름, 주소, 관리번호
 *       - 설명 필드
 *
 *       > 이 엔드포인트는 **슈퍼관리자 전용**이며, 인증 + 권한 체크가 통과되어야 합니다.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []   # MUST be SUPER_ADMIN
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAdminDTO'
 *           example:
 *             id: "e1b34cd2-7390-4d7e-a1b2-77d4a3ff0001"
 *             contact: "01098765432"
 *             name: "이관리"
 *             email: "admin_updated@hatsalapt.com"
 *             description: "연락처 및 주소 정보 수정"
 *             apartmentName: "햇살아파트 리뉴얼"
 *             apartmentAddress: "서울시 강남구 리뉴얼로 456"
 *             apartmentManagementNumber: "02-987-6543"
 *     responses:
 *       200:
 *         description: 관리자(아파트) 정보가 성공적으로 수정되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "[슈퍼관리자] 관리자 정보를 수정했습니다."
 *       400:
 *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다."
 *       401:
 *         description: 관리자 정보(아파트 정보) 수정 중 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "관리자 정보(아파트 정보) 수정 중 오류가 발생했습니다."
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
export const updateAdminController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = create(req.body, updateAdminStruct);
  const updated = await userService.updateAdmin(data);

  res.status(200).json({
    message: "[슈퍼관리자] 관리자 정보를 수정했습니다.",
  });
};

/**
 * @openapi
 * /api/auth/deleted-admin/{adminId}:
 *   delete:
 *     summary: "[슈퍼 관리자] 관리자 정보(아파트 정보 포함) 삭제"
 *     description: |
 *       지정된 **아파트 관리자(Admin) 계정**을 삭제합니다.<br>
 *       이 작업은 **SUPER_ADMIN 권한**이 있어야 수행할 수 있습니다.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []   # MUST be SUPER_ADMIN
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 삭제할 관리자(ADMIN) ID
 *         example: "e1b34cd2-7390-4d7e-a1b2-77d4a3ff0001"
 *     responses:
 *       200:
 *         description: 관리자 정보(아파트 정보 포함) 삭제가 완료되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "[슈퍼관리자] 관리자 정보를 삭제했습니다."
 *       400:
 *         description: 잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다."
 *       401:
 *         description: 관리자 정보(아파트 정보) 수정 중 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "관리자 정보(아파트 정보) 수정 중 오류가 발생했습니다."
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
export const deleteAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id: userId } = req.params;
  await userService.deleteAdmin(userId);

  res.status(200).json({ message: "[슈퍼관리자] 관리자 정보를 삭제했습니다." });
};

/**
 * @openapi
 * /api/auth/cleanup:
 *   post:
 *     summary: "[슈퍼 관리자/관리자] 거절된 계정을 정리(삭제)합니다.(슈퍼 관리자는 관리자 계정을, 관리자는 입주민 계정을 일괄 정리합니다.)"
 *     description: |
 *       **거절 상태(REJECTED)의 회원가입 신청 건을 일괄 정리(삭제)합니다.**
 *
 *       이 엔드포인트는 호출자의 **권한(role)** 에 따라 정리 대상이 달라집니다.
 *
 *       ### 동작 규칙
 *       - 호출자 **SUPER_ADMIN**: 거절된 **관리자(Admin) 신청**들을 모두 정리합니다.
 *       - 호출자 **ADMIN**: 거절된 **입주민(User) 가입 신청**들을 모두 정리합니다.
 *       - 호출자 **USER**: 접근 불가.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []   # SUPER_ADMIN 또는 ADMIN 필요
 *     responses:
 *       200:
 *         description: 거절된 관리자/사용자 정보가 일괄 정리(삭제)되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 # 필요 시 정리 건수 반환 필드 추가 가능 (예: deletedCount)
 *               example:
 *                 message: "거절한 사용자 정보를 일괄 정리했습니다."
 *       401:
 *         description: 거절한 관리자/사용자 정보 일괄 삭제 중 오류가 발생했습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "거절한 관리자/사용자 정보 일괄 삭제 중 오류가 발생했습니다"
 *       403:
 *         description: 접근 권한이 없습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "접근 권한이 없습니다."
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "서버 오류가 발생했습니다."
 */
export const deleteRejectedUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  const role = request.user.role;

  await userService.deleteRejectedUsersByRole(role);

  res.status(200).json({ message: "거절한 사용자 정보를 일괄 정리했습니다." });
};
