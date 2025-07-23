import { create } from "superstruct";
import { Request, Response } from "express";
import { USER_ROLE } from "@prisma/client";
import {
  CreateComplaintBodyStruct,
  ComplaintIdParamStruct,
  PatchComplaintBodyStruct,
  ComplaintStatusStruct,
} from "../structs/complaintStructs";
import complaintService from "../services/complaintService";
import registerSuccessMessage from "../lib/responseJson/registerSuccess";
import { PageParamsStruct } from "../structs/commonStructs";
import {
  ResponseComplaintCommentDTO,
  ResponseComplaintDTO,
  ResponseComplaintListDTO,
} from "../dto/complaintDTO";
import removeSuccessMessage from "../lib/responseJson/removeSuccess";
import { AuthenticatedRequest } from "@/types/express";
import ForbiddenError from "@/errors/ForbiddenError";

/**
 * @openapi
 * /api/complaints:
 *   post:
 *     summary: 민원 등록 [입주민]
 *     description: 사용자 권한 USER가 민원을 등록합니다. 제목, 내용, 공개 여부를 입력해야 합니다.
 *     tags:
 *       - Complaints
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 민원 제목
 *                 example: 엘리베이터 고장 신고
 *               content:
 *                 type: string
 *                 description: 민원 상세 내용
 *                 example: 101동 엘리베이터가 고장 났습니다. 점검이 필요합니다.
 *               isPublic:
 *                 type: boolean
 *                 description: 민원 공개 여부
 *                 example: true
 *     responses:
 *       201:
 *         description: 민원 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 정상적으로 등록 처리되었습니다.
 *       403:
 *         description: 권한이 없는 사용자입니다. USER 권한만 허용됩니다.
 *       400:
 *         description: 잘못된 요청입니다. 필수 데이터가 누락되었거나 형식이 잘못되었습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
export async function createComplaint(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const data = create(req.body, CreateComplaintBodyStruct);
  await complaintService.createComplaint(
    data,
    reqWithPayload.user.userId,
    reqWithPayload.user.apartmentId
  );

  res.status(201).send(new registerSuccessMessage());
}

/**
 * @openapi
 * /api/complaints:
 *   get:
 *     summary: 민원 목록 조회 [관리자/입주민]
 *     description: 사용자 권한에 따라 민원 목록을 페이지 단위로 조회합니다. SUPER_ADMIN 권한은 접근할 수 없습니다.
 *     tags:
 *       - Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호 기본값 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 11
 *         description: 페이지 크기 기본값 11
 *     responses:
 *       200:
 *         description: 민원 목록이 성공적으로 반환되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseComplaintListDTO'
 *       403:
 *         description: 권한이 없는 사용자입니다 SUPER_ADMIN은 접근할 수 없습니다
 *       400:
 *         description: 잘못된 요청입니다 페이지 번호 또는 페이지 크기가 유효하지 않습니다
 *       500:
 *         description: 서버 오류가 발생했습니다
 */
export async function getComplaintList(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const data = create(req.query, PageParamsStruct);
  const result = await complaintService.getComplaintList(
    reqWithPayload.user.userId,
    reqWithPayload.user.role as USER_ROLE,
    reqWithPayload.user.apartmentId,
    data
  );
  res.send(new ResponseComplaintListDTO(result));
}

/**
 * @openapi
 * /api/complaints/{complaintId}:
 *   get:
 *     summary: 민원 상세 조회 [관리자/입주민]
 *     description: 특정 민원의 상세 내용을 조회합니다 SUPER_ADMIN 권한은 접근할 수 없습니다
 *     tags:
 *       - Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 693cd12f-d156-4e07-9934-ad02a4fce664
 *         description: 조회할 민원 ID
 *     responses:
 *       200:
 *         description: 민원 상세가 성공적으로 반환되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseComplaintCommentDTO'
 *       403:
 *         description: 권한이 없는 사용자입니다 SUPER_ADMIN은 접근할 수 없습니다
 *       404:
 *         description: 민원을 찾을 수 없습니다
 *       500:
 *         description: 서버 오류가 발생했습니다
 */
export async function getComplaint(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const { complaintId } = create(req.params, ComplaintIdParamStruct);
  const result = await complaintService.getComplaint(
    complaintId,
    reqWithPayload.user.userId,
    reqWithPayload.user.role as USER_ROLE
  );
  res.send(new ResponseComplaintCommentDTO(result));
}

/**
 * @openapi
 * /api/complaints/{complaintId}:
 *   put:
 *     summary: 민원 수정 [입주민]
 *     description: USER 권한 사용자가 자신의 민원 내용을 수정합니다
 *     tags:
 *       - Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 693cd12f-d156-4e07-9934-ad02a4fce664
 *         description: 수정할 민원 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 수정할 제목
 *                 example: 제목을 수정합니다
 *               content:
 *                 type: string
 *                 description: 수정할 내용
 *                 example: 내용 수정 예시
 *               isPublic:
 *                 type: boolean
 *                 description: 공개 여부
 *                 example: true
 *     responses:
 *       200:
 *         description: 민원이 성공적으로 수정되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseComplaintDTO'
 *       403:
 *         description: USER 권한이 아닌 경우 접근할 수 없습니다
 *       404:
 *         description: 민원을 찾을 수 없습니다
 *       500:
 *         description: 서버 오류가 발생했습니다
 */
export async function editComplaint(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const data = create(req.body, PatchComplaintBodyStruct);
  const { complaintId } = create(req.params, ComplaintIdParamStruct);
  const complaint = await complaintService.updateComplaint(complaintId, data);
  res.status(200).send(new ResponseComplaintDTO(complaint));
}

/**
 * @openapi
 * /api/complaints/{complaintId}:
 *   delete:
 *     summary: 민원 삭제 [관리자]
 *     description: ADMIN 권한 사용자가 특정 민원을 삭제합니다
 *     tags:
 *       - Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 693cd12f-d156-4e07-9934-ad02a4fce664
 *         description: 삭제할 민원 ID
 *     responses:
 *       200:
 *         description: 민원이 성공적으로 삭제되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 정상적으로 삭제 처리되었습니다
 *       403:
 *         description: ADMIN 권한이 아닌 경우 접근할 수 없습니다
 *       404:
 *         description: 민원을 찾을 수 없습니다
 *       500:
 *         description: 서버 오류가 발생했습니다
 */
export async function removeComplaint(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const { complaintId } = create(req.params, ComplaintIdParamStruct);
  await complaintService.removeComplaint(complaintId);
  res.status(200).send(new removeSuccessMessage());
}

/**
 * @openapi
 * /api/complaints/{complaintId}/status:
 *   patch:
 *     summary: 민원 상태 변경 [관리자]
 *     description: ADMIN 권한 사용자가 민원의 상태를 변경합니다
 *     tags:
 *       - Complaints
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 693cd12f-d156-4e07-9934-ad02a4fce664
 *         description: 상태를 변경할 민원 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: 변경할 민원 상태
 *                 enum:
 *                   - PENDING
 *                   - IN_PROGRESS
 *                   - RESOLVED
 *                 example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: 민원 상태가 성공적으로 변경되었습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 상태 변경 성공
 *       403:
 *         description: ADMIN 권한이 아닌 경우 접근할 수 없습니다
 *       404:
 *         description: 민원을 찾을 수 없습니다
 *       500:
 *         description: 서버 오류가 발생했습니다
 */
export async function changeStatus(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const data = create(req.body, ComplaintStatusStruct);
  const { complaintId } = create(req.params, ComplaintIdParamStruct);
  const complaint = await complaintService.changeStatus(complaintId, {
    complaintStatus: data.status,
  });
  res.status(200).send({ message: "상태 변경 성공" });
}
