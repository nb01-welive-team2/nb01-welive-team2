import { create } from "superstruct";
import NotFoundError from "../lib/errors/NotFoundError";
import { IdParamsStruct } from "../structs/commonStructs";
import {
  CreateArticleBodyStruct,
  UpdateArticleBodyStruct,
  GetArticleListParamsStruct,
} from "../structs/articleStructs";
import {
  CreateCommentBodyStruct,
  GetCommentListParamsStruct,
} from "../structs/commentStruct";
import articleService from "../services/articleService";
import commentService from "../services/commentService";
import likeArticleService from "../services/likeArticleService";
import AlreadyExstError from "../lib/errors/AlreadyExstError";
import { Request, Response } from "express";
import { Prisma, USER_ROLE } from "@prisma/client";
import { UserWithId } from "../../types/user-with-id";
import {
  ArticleListWithCountDTO,
  ArticleWithLikeDTO,
} from "../lib/dtos/ArticleResDTO";
import { CommentListWithCursorDTO } from "../lib/dtos/CommentDTO";
import { RECENT_STRING, DESC_STRING, ASC_STRING } from "../config/constants";
import { CreateNoticeBodyStruct } from "../structs/noticeStructs";
import UnauthError from "../errors/UnauthError";

/**
 * @openapi
 * /articles:
 *   post:
 *     summary: 게시글 생성
 *     description: 사용자가 제목과 내용을 입력하여 새로운 게시글을 생성합니다.
 *     tags:
 *       - Articles
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
 *                 description: 게시글 제목
 *                 example: "My First Article"
 *               content:
 *                 type: string
 *                 description: 게시글 내용
 *                 example: "This is the content of my first article."
 *     responses:
 *       201:
 *         description: 게시글 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       400:
 *         description: 잘못된 요청. 입력 데이터가 유효하지 않습니다.
 */
export async function createNotice(req: Request, res: Response) {
  const reqUser = { id: 0, role: USER_ROLE.ADMIN }; // Assuming you get the user ID from the request, replace with actual logic
  const data = create(req.body, CreateNoticeBodyStruct);

  if (reqUser.role !== USER_ROLE.ADMIN) {
    throw new UnauthError();
  }

  const notice = await noticeService.create({
    ...data,
    userId: reqUser.id,
  });

  res.status(201).send(notice);
}

/**
 * @openapi
 * /companies:
 *   get:
 *     summary: 회사 목록 조회
 *     description: 회사 목록을 페이지 단위로 조회합니다. 관리자의 권한을 가진 사용자만 접근할 수 있습니다.
 *     tags:
 *       - Company
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지 크기
 *     responses:
 *       200:
 *         description: 회사 목록이 성공적으로 반환되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseCompanyListDTO'
 *       400:
 *         description: 잘못된 요청입니다. 유효하지 않은 페이지 번호 또는 페이지 크기일 수 있습니다.
 *       401:
 *         description: 관리자 권한이 없는 사용자입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
export const getCompanyList: RequestHandler = async (req, res) => {
  const reqUser = req.user as OmittedUser;
  if (reqUser.role !== USER_ROLE.ADMIN) {
    throw new UnauthError();
  }
  const data = create(req.query, PageParamsStruct);
  const result = await companyService.getCompanies(data);
  res.send(new ResponseCompanyListDTO(data.page, data.pageSize, result));
};

/**
 * @openapi
 * /companies/users:
 *   get:
 *     summary: 회사의 사용자 목록 조회
 *     description: 모든 회사의 사용자 목록을 페이지 단위로 조회합니다. 관리자의 권한을 가진 사용자만 접근할 수 있습니다.
 *     tags:
 *       - Company
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지 크기
 *     responses:
 *       200:
 *         description: 회사의 사용자 목록이 성공적으로 반환되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseCompanyUserListDTO'
 *       400:
 *         description: 잘못된 요청입니다. 유효하지 않은 페이지 번호 또는 페이지 크기일 수 있습니다.
 *       401:
 *         description: 관리자 권한이 없는 사용자입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
export const getCompanyUsers: RequestHandler = async (req, res) => {
  const reqUser = req.user as OmittedUser;
  if (reqUser.role !== USER_ROLE.ADMIN) {
    throw new UnauthError();
  }
  const pageParams = create(req.query, PageParamsStruct);
  const result = await userService.getCompanyUsers(pageParams);
  res.send(
    new ResponseCompanyUserListDTO(
      pageParams.page,
      pageParams.pageSize,
      result.users,
      result.totalItemCount
    )
  );
};

/**
 * @openapi
 * /companies/{companyId}:
 *   patch:
 *     summary: 회사 정보 수정
 *     description: 지정된 회사의 정보를 수정합니다. 관리자의 권한을 가진 사용자만 접근할 수 있습니다.
 *     tags:
 *       - Company
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 회사 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: 수정할 회사 이름
 *                 example: 햇살카 수정
 *               companyCode:
 *                 type: string
 *                 description: 수정할 회사 코드
 *                 example: HS-001
 *     responses:
 *       200:
 *         description: 회사 정보가 성공적으로 수정되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseCompanyDTO'
 *       400:
 *         description: 잘못된 요청입니다. 필수 필드가 누락되었거나 잘못된 형식일 수 있습니다.
 *       401:
 *         description: 관리자 권한이 없는 사용자입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

export const patchCompany: RequestHandler = async (req, res) => {
  const reqUser = req.user as OmittedUser;
  if (reqUser.role !== USER_ROLE.ADMIN) {
    throw new UnauthError();
  }
  const { companyId } = create(req.params, CompanyIdParamStruct);
  const data = create(req.body, PatchCompanyBodyStruct);
  const company = await companyService.updateCompany(companyId, data);
  res.send(company);
};

/**
 * @openapi
 * /companies/{companyId}:
 *   delete:
 *     summary: 회사 삭제
 *     description: 지정된 회사의 정보를 삭제합니다. 관리자의 권한을 가진 사용자만 접근할 수 있습니다.
 *     tags:
 *       - Company
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 회사 ID
 *     responses:
 *       200:
 *         description: 회사가 성공적으로 삭제되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "회사 삭제 성공"
 *       401:
 *         description: 관리자 권한이 없는 사용자입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
export const deleteCompany: RequestHandler = async (req, res, next) => {
  const reqUser = req.user as OmittedUser;
  if (reqUser.role !== USER_ROLE.ADMIN) {
    throw new UnauthError();
  }
  const companyId = parseInt(req.params.companyId as string, 10);
  await companyService.deleteCompany(companyId);
  res.status(200).send({ message: "회사 삭제 성공" });
};
