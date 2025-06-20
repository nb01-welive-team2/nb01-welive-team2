import {
  SignupAdminRequestDTO,
  SignupSuperAdminRequestDTO,
  SignupUserRequestDTO,
  UpdateAdminDTO,
} from "@/dto/userDTO";
import BadRequestError from "@/errors/BadRequestError";
import { hashPassword } from "@/lib/utils/hash";
import * as userRepository from "@/repositories/userRepository";

export const signupUser = async (data: SignupUserRequestDTO) => {
  const { username, password, contact, email } = data;
  await userRepository.usersUniqueColums(username, contact, email);

  const encryptedPassword = await hashPassword(password);
  const user = {
    ...data,
    password: encryptedPassword,
  };

  const signupUser = await userRepository.createUser(user);

  return signupUser;
};

export const signupAdmin = async (data: SignupAdminRequestDTO) => {
  const { username, password, contact, email } = data;

  await userRepository.usersUniqueColums(username, contact, email);

  const encryptedPassword = await hashPassword(password);
  const user = {
    ...data,
    password: encryptedPassword,
  };

  const signupUser = await userRepository.createAdmin(user);

  return signupUser;
};

export const signupSuperAdmin = async (data: SignupSuperAdminRequestDTO) => {
  const { username, contact, email, password } = data;

  await userRepository.usersUniqueColums(username, contact, email);

  const encryptedPassword = await hashPassword(password);
  const user = {
    ...data,
    password: encryptedPassword,
  };

  const signupSuperAdmin = await userRepository.createSuperAdmin(user);

  return signupSuperAdmin;
};

export const updateAdmin = async (
  data: UpdateAdminDTO
): Promise<UpdateAdminDTO> => {
  const updatedAdmin = await userRepository.updateAdminAndApartment(data);

  return updatedAdmin;
};

export const deleteAdmin = async (id: string) => {
  const deleted = await userRepository.deleteById(id);
  if (!deleted) {
    throw new BadRequestError("BadRequestError");
  }
};
