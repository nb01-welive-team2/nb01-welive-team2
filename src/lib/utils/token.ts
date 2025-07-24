import jwt from "jsonwebtoken";
import {
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
} from "../constance";
import UnauthError from "../../errors/UnauthError";
import { USER_ROLE } from "@prisma/client";
import { v4 as uuid } from "uuid";

export function generateTokens(
  userId: string,
  role: USER_ROLE,
  apartmentId: string
) {
  const jti = uuid();

  const accessToken = jwt.sign(
    { id: userId, role, apartmentId, jti },
    JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
  const refreshToken = jwt.sign(
    { id: userId, role, apartmentId, jti },
    JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return { accessToken, refreshToken, jti };
}

export function verifyAccessToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET);
    if (typeof decoded === "string") {
      throw new UnauthError();
    }
    return {
      userId: decoded.id,
      role: decoded.role,
      apartmentId: decoded.apartmentId,
      jti: decoded.jti,
    };
  } catch (error) {
    throw new UnauthError();
  }
}

export function verifyRefreshToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_TOKEN_SECRET);
    if (typeof decoded === "string") {
      throw new UnauthError();
    }
    return {
      userId: decoded.id,
      role: decoded.role,
      apartmentId: decoded.apartmentId,
      jti: decoded.jti,
    };
  } catch (error) {
    throw new UnauthError();
  }
}
