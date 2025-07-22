import BadRequestError from "@/errors/BadRequestError";
import { getUserByUsername, getUserId } from "@/repositories/userRepository";
import bcrypt from "bcrypt";
import { generateTokens, verifyRefreshToken } from "@/lib/utils/token";
import { LoginRequestDTO } from "@/structs/userStruct";
import { JOIN_STATUS, USER_ROLE } from "@prisma/client";
import UnauthError from "@/errors/UnauthError";
import * as userRepository from "@/repositories/userRepository";
import { hashPassword } from "@/lib/utils/hash";
import { redis } from "@/lib/redis";
import jwt from "jsonwebtoken";

export const login = async (data: LoginRequestDTO) => {
  const { username, password } = data;

  const user = await getUserByUsername(username);

  if (!user) {
    throw new UnauthError();
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.encryptedPassword
  );
  if (!isPasswordValid) {
    throw new UnauthError();
  }

  if (user.joinStatus !== JOIN_STATUS.APPROVED) {
    throw new UnauthError();
  }

  const userId = user.id;
  const role = user.role;

  let apartmentId;

  if (role === USER_ROLE.ADMIN && user.apartmentInfo) {
    apartmentId = user.apartmentInfo.id;
  } else if (role === USER_ROLE.USER && user.userInfo) {
    apartmentId = user.userInfo.apartmentId;
  } else if (role === USER_ROLE.SUPER_ADMIN) {
    apartmentId = null;
  } else {
    throw new UnauthError();
  }

  const { accessToken, refreshToken, jti } = generateTokens(
    userId,
    role,
    apartmentId!
  );

  await redis.set(`refresh_token:${userId}:${jti}`, refreshToken, {
    ex: 60 * 60 * 24 * 7,
  });

  return {
    accessToken,
    refreshToken,
    user,
  };
};

export const refreshToken = async (refreshToken?: string) => {
  if (!refreshToken) {
    throw new BadRequestError("Invalid refresh token");
  }

  const { userId, jti } = verifyRefreshToken(refreshToken);
  const key = `refresh_token:${userId}:${jti}`;
  const storedToken = await redis.get(key);

  // 토큰 탈취 의심되면 redis 토큰 전체 삭제
  if (!storedToken || storedToken !== refreshToken) {
    await deleteAllUserRefreshTokens(userId); // 사용자 단위로 관련 토큰 모두 삭제

    throw new UnauthError();
  }

  const user = await getUserId(userId);
  if (!user) {
    throw new BadRequestError("Invalid refresh token");
  }
  const role = user.role;
  const apartmentId = user.apartmentId;

  await redis.del(key);

  const {
    accessToken,
    refreshToken: newRefreshToken,
    jti: newJti,
  } = generateTokens(userId, role, apartmentId!);

  const newKey = `refresh_token:${userId}:${newJti}`;

  // 토큰 로테이션
  await redis.set(newKey, newRefreshToken, {
    ex: 60 * 60 * 24 * 7,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const updatePassword = async (
  id: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await userRepository.getUserId(id);
  if (!user) {
    throw new UnauthError();
  }

  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.encryptedPassword
  );
  if (!isPasswordValid) {
    throw new UnauthError();
  }

  const hashedPassword = await hashPassword(newPassword);
  await userRepository.updateUser(id, { encryptedPassword: hashedPassword });
  await deleteAllUserRefreshTokens(id); // 비밀번호 변경 시 사용자의 모든 쿠키 무효화하여 재로그인하도록 구현
};

export const logout = async (refreshToken: string, accessToken?: string) => {
  try {
    if (refreshToken) {
      const { userId, jti } = verifyRefreshToken(refreshToken);
      await redis.del(`refresh_token:${userId}:${jti}`);
    }

    if (accessToken) {
      const decoded = jwt.decode(accessToken) as any;
      if (decoded?.exp && decoded?.jti) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        await redis.set(`blacklist:access_token:${decoded.jti}`, true, {
          // 로그아웃 후 토큰을 블랙리스트로 분류
          ex: ttl,
        });
      }
    }
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

export const deleteAllUserRefreshTokens = async (userId: string) => {
  const pattern = `refresh_token:${userId}:*`;
  const keys = await redis.keys(pattern);
  await Promise.all(keys.map((k) => redis.del(k)));
};
