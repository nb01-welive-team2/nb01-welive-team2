import {
  SignupAdminRequestDTO,
  SignupSuperAdminRequestDTO,
  SignupUserRequestDTO,
  UpdateAdminDTO,
} from "@/dto/userDTO";
import BadRequestError from "@/errors/BadRequestError";
import { hashPassword } from "@/lib/utils/hash";
import * as userRepository from "@/repositories/userRepository";
import { USER_ROLE } from "@prisma/client";

export const signupUser = async (data: SignupUserRequestDTO) => {
  const { username, password, contact, email } = data;
  // await userRepository.usersUniqueColums(username, contact, email);

  const apartment = await userRepository.findApartment(data.apartmentName);
  if (!apartment) throw new BadRequestError("존재하지 않는 아파트입니다.");

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

  // await userRepository.usersUniqueColums(username, contact, email);

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

  // await userRepository.usersUniqueColums(username, contact, email);

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

export const deleteAdmin = async (id: string): Promise<void> => {
  const deleted = await userRepository.deleteById(id);
  if (!deleted) {
    throw new BadRequestError("BadRequestError");
  }
};

// TODO: [최고관리자/관리자] 거절 계정 관리

// export const deleteRejectedUsersByRole = async (role: USER_ROLE) => {
//   let userRole: USER_ROLE;

//   let result;
//   if (role === USER_ROLE.SUPER_ADMIN) {
//     userRole = USER_ROLE.ADMIN;
//     result = userRepository.deleteAdmins;
//   } else if (role === USER_ROLE.ADMIN) {
//     userRole = USER_ROLE.USER;
//     result = userRepository.deleteUsers;
//   } else {
//     throw new Error("해당 역할은 삭제 권한이 없습니다.");
//   }

//   // const result = await userRepository.deleteManyByRole(role);

//   return result;
// };
