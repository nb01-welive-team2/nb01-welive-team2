import { create } from "superstruct";
import { Request, Response } from "express";
import CommonError from "@/errors/CommonError";
import residentsService from "../services/residentsService";
import {
  createResidentBodyStruct,
  UpdateResidentBodyStruct,
} from "../structs/residentStruct";
import { AuthenticatedRequest } from "@/types/express";
import { RESIDENCE_STATUS } from "@prisma/client";
import { parseResidentsQuery } from "@/utils/residentsQuery";

// 입주민 명부 개별 등록
/**
 * @swagger
 * /api/residents/register:
 *   post:
 *     summary: "[관리자] 입주민 등록(개별 등록)"
 *     description: 관리자가 개별 입주민 정보를 등록합니다. 이메일은 선택 사항이며, 명부에 등록되지 않은 사용자도 추가할 수 있습니다.
 *     tags:
 *       - Residents
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - building
 *               - unitNumber
 *               - contact
 *               - name
 *               - isHouseholder
 *             properties:
 *               building:
 *                 type: number
 *                 description: 동 번호
 *                 example: 909
 *               unitNumber:
 *                 type: number
 *                 description: 호수
 *                 example: 9001
 *               contact:
 *                 type: string
 *                 description: 연락처
 *                 example: "010-9999-9999"
 *               name:
 *                 type: string
 *                 description: 입주민 이름
 *                 example: "홍길동"
 *               email:
 *                 type: string
 *                 description: 이메일 (선택 사항)
 *                 example: "hong@example.com"
 *               isHouseholder:
 *                 type: string
 *                 enum: [HOUSEHOLDER, NON_HOUSEHOLDER]
 *                 description: 세대주 여부
 *                 example: "HOUSEHOLDER"
 *     responses:
 *       201:
 *         description: 입주민 명부 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "uuid-1234-5678-90ab-cdef12345678"
 *                 apartmentId:
 *                   type: string
 *                   example: "apartment-uuid-1234"
 *                 building:
 *                   type: number
 *                   example: 101
 *                 unitNumber:
 *                   type: number
 *                   example: 1002
 *                 contact:
 *                   type: string
 *                   example: "010-1234-5678"
 *                 name:
 *                   type: string
 *                   example: "홍길동"
 *                 email:
 *                   type: string
 *                   example: "hong@example.com"
 *                 residenceStatus:
 *                   type: string
 *                   enum: [RESIDENCE, MOVE_OUT]
 *                   example: "RESIDENCE"
 *                 isHouseholder:
 *                   type: string
 *                   enum: [HOUSEHOLDER, NON_HOUSEHOLDER]
 *                   example: "HOUSEHOLDER"
 *                 isRegistered:
 *                   type: boolean
 *                   example: false
 *                 approvalStatus:
 *                   type: string
 *                   enum: [PENDING, APPROVED, REJECTED]
 *                   example: "PENDING"
 *       403:
 *         description: 권한이 없는 사용자 (ADMIN이 아님)
 *       400:
 *         description: 잘못된 요청 형식
 */
export async function uploadResidentController(req: Request, res: Response) {
  const { role, apartmentId } = (req as AuthenticatedRequest).user;
  const data = create(req.body, createResidentBodyStruct);
  const residents = await residentsService.uploadResident({
    ...data,
    email: data.email ?? "",
    apartmentId,
  });

  res.status(201).json(residents);
}

// 입주민 명부 CSV파일 업로드
/**
 * @swagger
 * /api/residents/upload:
 *   post:
 *     summary: "[관리자] 입주민 명부 CSV 파일 업로드"
 *     description: 관리자가 CSV 파일을 업로드하여 아파트 입주민 명부를 일괄 등록합니다.
 *     tags:
 *       - Residents
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 CSV 파일
 *     responses:
 *       201:
 *         description: 입주민 명부 업로드 성공
 *       400:
 *         description: 잘못된 요청 (아파트 정보 없거나 CSV 파일 누락)
 *       401:
 *         description: 인증되지 않은 사용자
 */
export async function uploadResidentsCsvController(
  req: Request,
  res: Response
) {
  const user = (req as AuthenticatedRequest).user;

  const apartmentId = user.apartmentId;
  if (!req.file) throw new CommonError("CSV 파일이 없습니다.", 400);

  const csvText = req.file.buffer.toString("utf-8");
  const createdResidents = await residentsService.uploadResidentsFromCsv(
    csvText,
    apartmentId
  );

  res.status(201).json();
}

// 입주민 명부 CSV 파일 다운로드
/**
 * @swagger
 * /api/residents/download:
 *   get:
 *     summary: "[관리자] 입주민 명부 CSV 파일 다운로드"
 *     description: 관리자 권한으로 필터 조건에 따라 아파트 입주민 명부를 CSV 파일로 다운로드합니다.
 *     tags:
 *       - Residents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: building
 *         schema:
 *           type: integer
 *         description: 동 (동 번호)
 *       - in: query
 *         name: unitNumber
 *         schema:
 *           type: integer
 *         description: 호수 (호 번호)
 *       - in: query
 *         name: residenceStatus
 *         schema:
 *           type: string
 *           enum: [RESIDENCE, NO_RESIDENCE]
 *         description: 거주 여부 필터
 *       - in: query
 *         name: isRegistered
 *         schema:
 *           type: boolean
 *         description: 위리브 가입 여부 필터
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: 이름 검색
 *       - in: query
 *         name: contact
 *         schema:
 *           type: string
 *         description: 연락처 검색
 *     responses:
 *       200:
 *         description: CSV 파일 다운로드 성공
 *       400:
 *         description: 잘못된 요청 (아파트 정보 누락 등)
 *       401:
 *         description: 인증되지 않은 사용자
 *       403:
 *         description: 권한이 없는 사용자 (관리자 전용)
 */
export async function downloadResidentsCsvController(
  req: Request,
  res: Response
) {
  const user = (req as AuthenticatedRequest).user;
 
  const apartmentId = user.apartmentId;
 

  const query = parseResidentsQuery({
    apartmentId,
    ...req.query,
  });

  const csv = await residentsService.getResidentsCsv(query);
  const filename = "residents.csv";

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(csv);
}

// 입주민 명부 CSV 템플릿 다운로드
/**
 * @swagger
 * /api/residents/template:
 *   get:
 *     summary: "[관리자] 입주민 명부 CSV 템플릿 다운로드"
 *     description: 관리자 권한으로 입주민 명부 작성용 CSV 템플릿 파일을 다운로드합니다.
 *     tags:
 *       - Residents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV 템플릿 다운로드 성공
 *       400:
 *         description: 잘못된 요청 (아파트 정보 누락)
 *       401:
 *         description: 인증되지 않은 사용자
 *       403:
 *         description: 권한이 없는 사용자 (관리자 전용)
 */
export async function downloadResidentsCsvTemplateController(
  req: Request,
  res: Response
) {
  const csv = await residentsService.getResidentsCsvTemplate();
  const filename = "resident-form.csv";

  res.header("Content-Type", "text/csv; charset=utf-8");
  res.header("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(csv);
}

// 입주민 목록 조회
/**
 * @openapi
 * /api/residents:
 *   get:
 *     summary: "[관리자] 입주민 목록 조회"
 *     description: 관리자가 특정 아파트에 대해 입주민 명부를 조건에 따라 조회합니다.
 *     tags:
 *       - Residents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: building
 *         schema:
 *           type: string
 *         description: 동
 *       - in: query
 *         name: unitNumber
 *         schema:
 *           type: string
 *         description: 호수
 *       - in: query
 *         name: residenceStatus
 *         schema:
 *           type: string
 *           enum: [RESIDENCE, NO_RESIDENCE]
 *         description: 거주 여부
 *       - in: query
 *         name: isRegistered
 *         schema:
 *           type: boolean
 *         description: 위리브 가입 여부
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: 이름 검색
 *       - in: query
 *         name: contact
 *         schema:
 *           type: string
 *         description: 연락처 검색
 *     responses:
 *       200:
 *         description: 입주민 명부 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 residents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "uuid-1234"
 *                       name:
 *                         type: string
 *                         example: "홍길동"
 *                       contact:
 *                         type: string
 *                         example: "010-1234-5678"
 *                       email:
 *                         type: string
 *                         example: "hong@example.com"
 *                       isHouseholder:
 *                         type: string
 *                         enum: [HOUSEHOLDER, NON_HOUSEHOLDER]
 *                         example: "HOUSEHOLDER"
 *                       residenceStatus:
 *                         type: string
 *                         enum: [RESIDENCE, MOVE_OUT]
 *                         example: "RESIDENCE"
 *                       approvalStatus:
 *                         type: string
 *                         enum: [PENDING, APPROVED, REJECTED]
 *                         example: "PENDING"
 *                 message:
 *                   type: string
 *                   example: "조회된 입주민 결과가 1건 입니다."
 *                 count:
 *                   type: number
 *                   example: 1
 *       401:
 *         description: 인증되지 않음
 *       403:
 *         description: 권한이 없는 사용자
 */
export async function getResidentsListFilteredController(
  req: Request,
  res: Response
) {
  const { role, apartmentId } = (req as AuthenticatedRequest).user;
  const query = parseResidentsQuery({
    apartmentId,
    ...req.query,
  });

  const { residents, count } = await residentsService.getResidentsList(query);

  res.status(200).json({
    residents,
    message: `조회된 입주민 결과가 ${count}건 입니다.`,
    count,
  });
}

// 입주민 상세 조회
/**
 * @swagger
 * /api/residents/{id}:
 *   get:
 *     summary: "[관리자] 입주민 상세 조회"
 *     description: 특정 아파트의 입주민 ID로 상세 정보를 조회합니다. 관리자 권한 필요.
 *     tags:
 *       - Residents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 조회할 입주민의 고유 ID
 *         schema:
 *           type: string
 *           example: "69f298ce-5775-4206-b377-d083313e4946"
 *     responses:
 *       200:
 *         description: 입주민 상세 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "uuid-1234"
 *                 name:
 *                   type: string
 *                   example: "홍길동"
 *                 contact:
 *                   type: string
 *                   example: "010-1234-5678"
 *                 email:
 *                   type: string
 *                   example: "hong@example.com"
 *                 isHouseholder:
 *                   type: string
 *                   enum: [HOUSEHOLDER, NON_HOUSEHOLDER]
 *                   example: "HOUSEHOLDER"
 *                 residenceStatus:
 *                   type: string
 *                   enum: [RESIDENCE, MOVE_OUT]
 *                   example: "RESIDENCE"
 *                 approvalStatus:
 *                   type: string
 *                   enum: [PENDING, APPROVED, REJECTED]
 *                   example: "PENDING"
 *       403:
 *         description: 권한이 없는 사용자
 *       404:
 *         description: 입주민을 찾을 수 없음
 *       401:
 *         description: 인증되지 않음
 */
export async function getResidentByIdController(req: Request, res: Response) {
  const { id } = req.params;
  const { apartmentId, role } = (req as AuthenticatedRequest).user;
  await residentsService.residentAccessCheck(id, apartmentId);
  const resident = await residentsService.getResident(id);
  if (!resident) {
    throw new CommonError("입주민이 존재 하지 않습니다.", 404);
  }

  res.status(200).json(resident);
}

// 입주민 정보 수정
/**
 * @swagger
 * /api/residents/{id}:
 *   patch:
 *     summary: "[관리자] 입주민 정보 수정"
 *     description: 특정 아파트 입주민의 정보를 수정합니다. 관리자 권한 필요.
 *     tags:
 *       - Residents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 수정할 입주민의 고유 ID
 *         schema:
 *           type: string
 *           example: "69f298ce-5775-4206-b377-d083313e4946"
 *     requestBody:
 *       description: 수정할 입주민 정보
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "updated@example.com"
 *     responses:
 *       200:
 *         description: 입주민 정보 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "uuid-1234"
 *                 name:
 *                   type: string
 *                   example: "홍길동"
 *                 contact:
 *                   type: string
 *                   example: "010-1234-5678"
 *                 email:
 *                   type: string
 *                   example: "hong@example.com"
 *                 isHouseholder:
 *                   type: string
 *                   enum: [HOUSEHOLDER, NON_HOUSEHOLDER]
 *                   example: "HOUSEHOLDER"
 *                 residenceStatus:
 *                   type: string
 *                   enum: [RESIDENCE, MOVE_OUT]
 *                   example: "RESIDENCE"
 *                 approvalStatus:
 *                   type: string
 *                   enum: [PENDING, APPROVED, REJECTED]
 *                   example: "PENDING"
 *       403:
 *         description: 권한이 없는 사용자
 *       404:
 *         description: 입주민을 찾을 수 없음
 *       401:
 *         description: 인증되지 않음
 */
export async function updateResidentInfoController(
  req: Request,
  res: Response
) {
  const { id } = req.params;
  const { apartmentId, role } = (req as AuthenticatedRequest).user;
  const data = create(req.body, UpdateResidentBodyStruct);
  await residentsService.residentAccessCheck(id, apartmentId);
  const resident = await residentsService.patchResident(id, data);

  res.status(200).json(resident);
}

// 입주민 정보 삭제
/**
 * @swagger
 * /api/residents/{id}:
 *   delete:
 *     summary: "[관리자] 입주민 정보 삭제"
 *     description: 특정 아파트 입주민 정보를 삭제합니다. 관리자 권한 필요.
 *     tags:
 *       - Residents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 삭제할 입주민의 고유 ID
 *         schema:
 *           type: string
 *           example: "69f298ce-5775-4206-b377-d083313e4946"
 *     responses:
 *       200:
 *         description: 입주민 정보 삭제 성공
 *       403:
 *         description: 권한이 없는 사용자
 *       404:
 *         description: 입주민을 찾을 수 없음
 *       401:
 *         description: 인증되지 않음
 */
export async function deleteResidentController(req: Request, res: Response) {
  const { id } = req.params;
  const { apartmentId, role } = (req as AuthenticatedRequest).user;
  await residentsService.residentAccessCheck(id, apartmentId);
  await residentsService.removeResident(id);

  res.status(200).json();
}

