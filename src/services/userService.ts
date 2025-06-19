import { SignupUserRequestDTO } from "@/dto/userDTO";
import BadRequestError from "@/errors/BadRequestError";
import { hashPassword } from "@/lib/utils/hash";
import * as userRepository from "@/repositories/userRepository";
import { USER_ROLE } from "@prisma/client";

export const signupUser = async (data: SignupUserRequestDTO) => {
  const { username, password, contact, email, apartmentDong, apartmentHo } =
    data;
  await userRepository.usersUniqueColums(username, contact, email);

  const encryptedPassword = await hashPassword(password);
  const user = {
    ...data,
    password: encryptedPassword,
    apartmentDong: Number(apartmentDong),
    apartmentHo: Number(apartmentHo),
  };

  const signupUser = await userRepository.createUser(user);

  return signupUser;
};
