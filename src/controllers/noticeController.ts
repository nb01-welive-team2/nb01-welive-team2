import { create } from "superstruct";
import { Request, Response } from "express";
import { USER_ROLE } from "@prisma/client";
import { CreateNoticeBodyStruct } from "../structs/noticeStructs";
import UnauthError from "../errors/UnauthError";
import noticeService from "../services/noticeService";
import { randomUUID } from "crypto";
import registerSuccessMessage from "../lib/responseJson/registerSuccess";
import { PageParamsStruct } from "../structs/commonStructs";
import { ResponseNoticeListDTO } from "../dto/noticeDTO";

/**
 * @openapi
 * /articles:
 *   post:
 *     summary: 공지사항 생성
 *     description: 관리자가 공지 카테고리, 제목, 내용 등을 입력하여 새로운 공지사항을 생성합니다.
 *     tags:
 *       - Notices
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: 공지 카테고리
 *                 example: "MAINTENANCE"
 *               title:
 *                 type: string
 *                 description: 공지사항 제목
 *                 example: "서비스 점검 안내"
 *               content:
 *                 type: string
 *                 description: 공지사항 내용
 *                 example: "2025년 6월 20일 02:00 ~ 04:00 시스템 점검이 예정되어 있습니다."
 *               isPinned:
 *                 type: boolean
 *                 description: 상단 고정 여부
 *                 example: true
 *     responses:
 *       201:
 *         description: 공지사항 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 정상적으로 등록 처리되었습니다.
 *       400:
 *         description: 잘못된 요청. 입력 데이터가 유효하지 않습니다.
 *       401:
 *         description: 인증되지 않음. 관리자만 공지사항을 생성할 수 있습니다.
 */
export async function createNotice(req: Request, res: Response) {
  const reqUser = { id: randomUUID(), role: USER_ROLE.ADMIN }; // Assuming you get the user ID from the request, replace with actual logic
  const data = create(req.body, CreateNoticeBodyStruct);

  if (reqUser.role !== USER_ROLE.ADMIN) {
    throw new UnauthError();
  }

  await noticeService.createNotice(data, reqUser.id);

  res.status(201).send(new registerSuccessMessage());
}

/**
 * @openapi
 * /notices:
 *   get:
 *     summary: 공지사항 목록 조회
 *     description: 사용자 권한에 따라 공지사항 목록을 페이지 단위로 조회합니다.
 *                  SUPER_ADMIN 권한 사용자는 접근이 제한됩니다.
 *     tags:
 *       - Notices
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호 기본값 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 11
 *         description: 페이지 크기 기본값 11
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 공지사항 목록이 성공적으로 반환되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseNoticeListDTO'
 *       401:
 *         description: 권한이 없는 사용자입니다. (예: SUPER_ADMIN 접근 제한)
 *       400:
 *         description: 잘못된 요청입니다. 유효하지 않은 페이지 번호 또는 페이지 크기일 수 있습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
export async function getNoticeList(req: Request, res: Response) {
  const reqUser = { id: randomUUID(), role: USER_ROLE.USER }; // Assuming you get the user ID from the request, replace with actual logic
  if ((reqUser.role as string) === USER_ROLE.SUPER_ADMIN) {
    throw new UnauthError();
  }
  const data = create(req.query, PageParamsStruct);
  const result = await noticeService.getNotices(reqUser.id, reqUser.role, data);
  res.send(new ResponseNoticeListDTO(result));
}

// /**
//  * @openapi
//  * /companies/users:
//  *   get:
//  *     summary: 회사의 사용자 목록 조회
//  *     description: 모든 회사의 사용자 목록을 페이지 단위로 조회합니다. 관리자의 권한을 가진 사용자만 접근할 수 있습니다.
//  *     tags:
//  *       - Company
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *         description: 페이지 번호
//  *       - in: query
//  *         name: pageSize
//  *         schema:
//  *           type: integer
//  *           default: 10
//  *         description: 페이지 크기
//  *     responses:
//  *       200:
//  *         description: 회사의 사용자 목록이 성공적으로 반환되었습니다.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ResponseCompanyUserListDTO'
//  *       400:
//  *         description: 잘못된 요청입니다. 유효하지 않은 페이지 번호 또는 페이지 크기일 수 있습니다.
//  *       401:
//  *         description: 관리자 권한이 없는 사용자입니다.
//  *       500:
//  *         description: 서버 오류가 발생했습니다.
//  */
// export const getCompanyUsers: RequestHandler = async (req, res) => {
//   const reqUser = req.user as OmittedUser;
//   if (reqUser.role !== USER_ROLE.ADMIN) {
//     throw new UnauthError();
//   }
//   const pageParams = create(req.query, PageParamsStruct);
//   const result = await userService.getCompanyUsers(pageParams);
//   res.send(
//     new ResponseCompanyUserListDTO(
//       pageParams.page,
//       pageParams.pageSize,
//       result.users,
//       result.totalItemCount
//     )
//   );
// };

// /**
//  * @openapi
//  * /companies/{companyId}:
//  *   patch:
//  *     summary: 회사 정보 수정
//  *     description: 지정된 회사의 정보를 수정합니다. 관리자의 권한을 가진 사용자만 접근할 수 있습니다.
//  *     tags:
//  *       - Company
//  *     parameters:
//  *       - in: path
//  *         name: companyId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: 수정할 회사 ID
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               companyName:
//  *                 type: string
//  *                 description: 수정할 회사 이름
//  *                 example: 햇살카 수정
//  *               companyCode:
//  *                 type: string
//  *                 description: 수정할 회사 코드
//  *                 example: HS-001
//  *     responses:
//  *       200:
//  *         description: 회사 정보가 성공적으로 수정되었습니다.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ResponseCompanyDTO'
//  *       400:
//  *         description: 잘못된 요청입니다. 필수 필드가 누락되었거나 잘못된 형식일 수 있습니다.
//  *       401:
//  *         description: 관리자 권한이 없는 사용자입니다.
//  *       500:
//  *         description: 서버 오류가 발생했습니다.
//  */

// export const patchCompany: RequestHandler = async (req, res) => {
//   const reqUser = req.user as OmittedUser;
//   if (reqUser.role !== USER_ROLE.ADMIN) {
//     throw new UnauthError();
//   }
//   const { companyId } = create(req.params, CompanyIdParamStruct);
//   const data = create(req.body, PatchCompanyBodyStruct);
//   const company = await companyService.updateCompany(companyId, data);
//   res.send(company);
// };

// /**
//  * @openapi
//  * /companies/{companyId}:
//  *   delete:
//  *     summary: 회사 삭제
//  *     description: 지정된 회사의 정보를 삭제합니다. 관리자의 권한을 가진 사용자만 접근할 수 있습니다.
//  *     tags:
//  *       - Company
//  *     parameters:
//  *       - in: path
//  *         name: companyId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: 삭제할 회사 ID
//  *     responses:
//  *       200:
//  *         description: 회사가 성공적으로 삭제되었습니다.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: "회사 삭제 성공"
//  *       401:
//  *         description: 관리자 권한이 없는 사용자입니다.
//  *       500:
//  *         description: 서버 오류가 발생했습니다.
//  */
// export const deleteCompany: RequestHandler = async (req, res, next) => {
//   const reqUser = req.user as OmittedUser;
//   if (reqUser.role !== USER_ROLE.ADMIN) {
//     throw new UnauthError();
//   }
//   const companyId = parseInt(req.params.companyId as string, 10);
//   await companyService.deleteCompany(companyId);
//   res.status(200).send({ message: "회사 삭제 성공" });
// };
