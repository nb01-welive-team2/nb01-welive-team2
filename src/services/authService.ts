import BadRequestError from "../errors/BadRequestError";
import { getUserByUsername } from "../repositories/userRepository";
import bcrypt from "bcrypt";
import { generateTokens } from "../lib/utils/token";
import { LoginRequestDTO } from "../dto/authDTO";
import { UserType } from "../types/User";

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
  const { accessToken, refreshToken } = generateTokens(userId, role);

  return {
    accessToken,
    refreshToken,
  };
};
