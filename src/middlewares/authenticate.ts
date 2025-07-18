import { getUserId } from "@/repositories/userRepository";
import UnauthError from "../errors/UnauthError";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../lib/constance";
import { verifyAccessToken, verifyRefreshToken } from "../lib/utils/token";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { AuthenticatedUser } from "@/types/User";
import { redis } from "@/lib/redis";

/**
 * authenticate 미들웨어 사용방법
 * access token 사용(사실상 일반 로그인)할 경우: authenticate({ optional: false }) 사용
 * [ex] pollRouter.post('/', authenticate({ optional: false }), withAsync(createPoll))
 *
 * refresh token 사용(토큰 갱신)할 경우:authenticate({ optional: true }) 사용
 * [ex] authRouter.post("/refresh", authenticate({ optional: true }), withAsync(refreshToken));
 **/

function authenticate(options = { optional: false }): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies[ACCESS_TOKEN_COOKIE_NAME];
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (!options.optional) {
      if (!accessToken) {
        return next(new UnauthError());
      }

      try {
        const { userId, role, apartmentId, jti } =
          verifyAccessToken(accessToken);
        const isBlacklisted = await redis.get(`blacklist:access_token:${jti}`);

        if (isBlacklisted) {
          return next(new UnauthError());
        }

        const user = await getUserId(userId);

        if (
          !user ||
          user.id !== userId ||
          user.role !== role ||
          user.apartmentId !== apartmentId
        ) {
          return next(new UnauthError());
        }

        req.user = { userId, role, apartmentId } as AuthenticatedUser;

        return next();
      } catch (error) {
        return next(new UnauthError());
      }
    } else {
      if (!refreshToken) {
        return next(new UnauthError());
      }

      try {
        const { userId, role, apartmentId } = verifyRefreshToken(refreshToken);
        const user = await getUserId(userId);

        if (
          !user ||
          user.id !== userId ||
          user.role !== role ||
          user.apartmentId !== apartmentId
        ) {
          return next(new UnauthError());
        }

        req.user = { userId, role, apartmentId } as AuthenticatedUser;
        return next();
      } catch (error) {
        return next(new UnauthError());
      }
    }
  };
}

export function optionalAuth(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies[ACCESS_TOKEN_COOKIE_NAME];

    if (!accessToken) {
      return next();
    }

    try {
      const { userId, role, apartmentId } = verifyAccessToken(accessToken);
      req.user = { userId, role, apartmentId };
    } catch (error) {
      return next(new UnauthError());
    }
    return next();
  };
}

export default authenticate;
