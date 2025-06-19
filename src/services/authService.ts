import BadRequestError from "@/errors/BadRequestError";
import { getUserByUsername, getUserId } from "@/repositories/userRepository";
import bcrypt from "bcrypt";
import { generateTokens, verifyRefreshToken } from "@/lib/utils/token";
import { LoginRequestDTO } from "@/structs/userStruct";

// export const register = async(data: Omit<UserType, 'id'> )

export const login = async (data: LoginRequestDTO) => {
  const { username, password } = data;
  const user = await getUserByUsername(username);
  if (!user) {
    throw new BadRequestError("Invalid login information");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.encryptedPassword
  );
  if (!isPasswordValid) {
    throw new BadRequestError("Invalid login information");
  }

  const userId = user.id;
  const role = user.role;
  const apartmentId = user.apartmentInfo?.id;

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
