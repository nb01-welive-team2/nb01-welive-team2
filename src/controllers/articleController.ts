import { create } from 'superstruct';
import NotFoundError from '../lib/errors/NotFoundError';
import { IdParamsStruct } from '../structs/commonStructs';
import {
  CreateArticleBodyStruct,
  UpdateArticleBodyStruct,
  GetArticleListParamsStruct,
} from '../structs/articleStructs';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../structs/commentStruct';
import articleService from '../services/articleService';
import commentService from '../services/commentService';
import likeArticleService from '../services/likeArticleService';
import AlreadyExstError from '../lib/errors/AlreadyExstError';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { UserWithId } from '../../types/user-with-id';
import { ArticleListWithCountDTO, ArticleWithLikeDTO } from '../lib/dtos/ArticleResDTO';
import { CommentListWithCursorDTO } from '../lib/dtos/CommentDTO';
import { RECENT_STRING, DESC_STRING, ASC_STRING } from '../config/constants';

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

/**
 * @openapi
 * /articles/{id}:
 *   get:
 *     summary: 게시글 조회
 *     description: 특정 ID를 가진 게시글을 조회합니다.
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 조회할 게시글의 ID
 *     responses:
 *       200:
 *         description: 게시글 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArticleWithLikeDTO'
 *       404:
 *         description: 게시글을 찾을 수 없습니다.
 */
export async function getArticle(req: Request, res: Response) {
  const { id } = create(req.params, IdParamsStruct);
  const article = await articleService.getById(id);
  if (!article) {
    throw new NotFoundError(articleService.getEntityName(), id);
  }

  if (!req.user) {
    res.send(article);
  } else {
    const reqUser = req.user as UserWithId;
    const { id: userId } = create({ id: reqUser.id }, IdParamsStruct);
    const like = await likeArticleService.getById(userId, id);
    res.send(new ArticleWithLikeDTO(article, like));
  }
}

/**
 * @openapi
 * /articles/{id}:
 *   patch:
 *     summary: 게시글 수정
 *     description: 특정 ID를 가진 게시글의 내용을 수정합니다.
 *     tags:
 *       - Articles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 수정할 게시글의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 수정할 게시글 제목
 *               content:
 *                 type: string
 *                 description: 수정할 게시글 내용
 *     responses:
 *       200:
 *         description: 게시글 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       404:
 *         description: 게시글을 찾을 수 없습니다.
 */
export async function updateArticle(req: Request, res: Response) {
  const { id } = create(req.params, IdParamsStruct);
  const data = create(req.body, UpdateArticleBodyStruct);

  const article = await articleService.update(id, data);
  res.send(article);
}

/**
 * @openapi
 * /articles/{id}:
 *   delete:
 *     summary: 게시글 삭제
 *     description: 특정 ID를 가진 게시글을 삭제합니다.
 *     tags:
 *       - Articles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 삭제할 게시글의 ID
 *     responses:
 *       204:
 *         description: 게시글 삭제 성공
 *       404:
 *         description: 게시글을 찾을 수 없습니다.
 */
export async function deleteArticle(req: Request, res: Response) {
  const { id } = create(req.params, IdParamsStruct);

  await articleService.remove(id);
  res.status(204).send();
}

/**
 * @openapi
 * /articles:
 *   get:
 *     summary: 게시글 목록 조회
 *     description: 페이지네이션 및 검색 조건을 기반으로 게시글 목록을 조회합니다.
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: number
 *         description: 페이지 번호
 *       - in: query
 *         name: pageSize
 *         required: true
 *         schema:
 *           type: number
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: orderBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [recent]
 *         description: 정렬 기준
 *       - in: query
 *         name: keyword
 *         required: false
 *         schema:
 *           type: string
 *         description: 검색 키워드
 *     responses:
 *       200:
 *         description: 게시글 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArticleListWithCountDTO'
 */
export async function getArticleList(req: Request, res: Response) {
  const { page, pageSize, orderBy, keyword } = create(req.query, GetArticleListParamsStruct);
  const search = {
    where: {
      OR: [
        { title: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
        { content: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
      ],
    },
  };

  const totalCount = await articleService.count({ where: keyword ? search.where : {} });
  const articles = await articleService.getList({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderBy === RECENT_STRING ? { createdAt: DESC_STRING } : { createdAt: ASC_STRING },
    where: keyword ? search.where : {},
  });
  res.send(new ArticleListWithCountDTO(articles, totalCount));
}

/**
 * @openapi
 * /articles/{id}/comments:
 *   post:
 *     summary: 댓글 생성
 *     description: 특정 게시글에 댓글을 작성합니다.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 댓글을 작성할 게시글의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 댓글 내용
 *                 example: "This is a comment."
 *     responses:
 *       201:
 *         description: 댓글 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: 게시글을 찾을 수 없습니다.
 */
export async function createComment(req: Request, res: Response) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, CreateCommentBodyStruct);
  const reqUser = req.user as UserWithId;
  const { id: userId } = create({ id: reqUser.id }, IdParamsStruct);

  const article = await articleService.getById(articleId);
  if (!article) {
    throw new NotFoundError(articleService.getEntityName(), articleId);
  }

  const comment = await commentService.create(content, userId, articleId);

  res.status(201).send(comment);
}

/**
 * @openapi
 * /articles/{id}/comments:
 *   get:
 *     summary: 댓글 목록 조회
 *     description: 특정 게시글의 댓글 목록을 조회합니다.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 댓글을 조회할 게시글의 ID
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: number
 *         description: 다음 페이지를 위한 커서
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: number
 *         description: 가져올 댓글 수
 *     responses:
 *       200:
 *         description: 댓글 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentListWithCursorDTO'
 *       404:
 *         description: 게시글을 찾을 수 없습니다.
 */
export async function getCommentList(req: Request, res: Response) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const { cursor, limit } = create(req.query, GetCommentListParamsStruct);

  const article = await articleService.getById(articleId);
  if (!article) {
    throw new NotFoundError(articleService.getEntityName(), articleId);
  }

  const commentsWithCursor = await commentService.getList({
    cursor: cursor ? { id: cursor } : undefined,
    take: limit + 1,
    where: { articleId },
    orderBy: { createdAt: DESC_STRING },
  });

  const comments = commentsWithCursor.slice(0, limit);
  const cursorComment = commentsWithCursor[commentsWithCursor.length - 1];
  const nextCursor = cursorComment ? cursorComment.id : null;

  res.send(new CommentListWithCursorDTO(comments, nextCursor));
}

/**
 * @openapi
 * /articles/{id}/like:
 *   get:
 *     summary: 게시글 좋아요 추가
 *     description: 특정 게시글에 대해 사용자가 좋아요를 추가합니다.
 *     tags:
 *       - Articles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 좋아요를 추가할 게시글의 ID
 *     responses:
 *       200:
 *         description: 좋아요 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                   description: 좋아요가 추가된 상태
 *                   example: true
 *       404:
 *         description: 게시글을 찾을 수 없습니다.
 *       422:
 *         description: 이미 좋아요가 추가된 상태입니다.
 */
export async function likeArticle(req: Request, res: Response) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const reqUser = req.user as UserWithId;
  const { id: userId } = create({ id: reqUser.id }, IdParamsStruct);

  const article = await articleService.getById(articleId);
  if (!article) {
    throw new NotFoundError(articleService.getEntityName(), articleId);
  }

  const existedLike = await likeArticleService.getById(userId, articleId);
  if (existedLike) {
    throw new AlreadyExstError(likeArticleService.getEntityName());
  }

  const like = await likeArticleService.create({
    userId: userId,
    articleId: articleId,
  });
  res.send(like);
}

/**
 * @openapi
 * /articles/{id}/dislike:
 *   get:
 *     summary: 게시글 좋아요 제거
 *     description: 특정 게시글에 대해 사용자가 추가한 좋아요를 제거합니다.
 *     tags:
 *       - Articles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 좋아요를 제거할 게시글의 ID
 *     responses:
 *       204:
 *         description: 좋아요 제거 성공
 *       404:
 *         description: 좋아요가 존재하지 않아 제거할 수 없습니다.
 */
export async function dislikeArticle(req: Request, res: Response) {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const reqUser = req.user as UserWithId;
  const { id: userId } = create({ id: reqUser.id }, IdParamsStruct);

  const existedLike = await likeArticleService.getById(userId, articleId);
  if (!existedLike) {
    throw new NotFoundError(likeArticleService.getEntityName(), userId);
  }

  await likeArticleService.remove(userId, articleId);
  res.status(204).send();
}
