import NotFoundError from '../lib/errors/NotFoundError';
import ForbiddenError from '../lib/errors/ForbiddenError';
import articleService from '../services/articleService';
import { IdParamsStruct } from '../structs/commonStructs';
import { create } from 'superstruct';
import { NextFunction, Request, Response } from 'express';
import { UserWithId } from '../../types/user-with-id';

async function verifyAricleOwner(req: Request, res: Response, next: NextFunction) {
  const reqUser = req.user as UserWithId;
  const { id: userId } = create({ id: reqUser.id }, IdParamsStruct);
  try {
    const { id: articleId } = create(req.params, IdParamsStruct);

    const article = await articleService.getById(articleId);

    if (!article) {
      throw new NotFoundError(articleService.getEntityName(), articleId);
    }

    if (article.userId !== userId) {
      throw new ForbiddenError(articleService.getEntityName(), articleId, userId);
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export default {
  verifyAricleOwner,
};
