import jwt from "jsonwebtoken";
import {
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
} from "../constance";
import UnauthError from "../../errors/UnauthError";
import { USER_ROLE } from "@prisma/client";

export function generateTokens(
  userId: string,
  role: USER_ROLE,
  apartmentId: string
) {
  const accessToken = jwt.sign(
    { id: userId, role, apartmentId },
    JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1h",
    }
  );
  const refreshToken = jwt.sign(
    { id: userId, role, apartmentId },
    JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return { accessToken, refreshToken };
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
    };
  } catch (error) {
    throw new UnauthError();
  }
}
