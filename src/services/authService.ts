import BadRequestError from "@/errors/BadRequestError";
import { getUserByUsername, getUserId } from "@/repositories/userRepository";
import bcrypt from "bcrypt";
import { generateTokens, verifyRefreshToken } from "@/lib/utils/token";
import { LoginRequestDTO } from "@/structs/userStruct";
import { USER_ROLE } from "@prisma/client";
import UnauthError from "@/errors/UnauthError";

// export const register = async(data: Omit<UserType, 'id'> )

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

  const userId = user.id;
  const role = user.role;

  let apartmentId;

  if (role === USER_ROLE.ADMIN && user.apartmentInfo) {
    apartmentId = user.apartmentInfo.id;
  } else if (role === USER_ROLE.USER && user.userInfo) {
    apartmentId = user.userInfo.apartmentId;
  } else if (role === USER_ROLE.SUPER_ADMIN) {
    apartmentId = undefined;
  } else {
    throw new UnauthError();
  }

  const { accessToken, refreshToken } = generateTokens(
    userId,
    role,
    apartmentId!
  );
  return {
    accessToken,
    refreshToken,
  };
};

export const refreshToken = async (refreshToken?: string) => {
  if (!refreshToken) {
    throw new BadRequestError("Invalid refresh token");
  }

  const { userId } = verifyRefreshToken(refreshToken);
  const user = await getUserId(userId);
  if (!user) {
    throw new BadRequestError("Invalid refresh token");
  }
  const role = user.role;
  const apartmentId = user.apartmentInfo?.id;

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    userId,
    role,
    apartmentId!
  );

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};
