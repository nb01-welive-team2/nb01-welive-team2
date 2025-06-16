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
import { Prisma } from "@prisma/client";
import { UserWithId } from "../../types/user-with-id";
import {
  ArticleListWithCountDTO,
  ArticleWithLikeDTO,
} from "../lib/dtos/ArticleResDTO";
import { CommentListWithCursorDTO } from "../lib/dtos/CommentDTO";
import { RECENT_STRING, DESC_STRING, ASC_STRING } from "../config/constants";

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
export async function createArticle(req: Request, res: Response) {
  const reqUser = req.user as UserWithId;
  const data = create(req.body, CreateArticleBodyStruct);
  const { id: userId } = create({ id: reqUser.id }, IdParamsStruct);

  const article = await articleService.create({
    ...data,
    userId: userId,
  });

  res.status(201).send(article);
}
