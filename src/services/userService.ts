import {
  SignupAdminRequestDTO,
  SignupSuperAdminRequestDTO,
  SignupUserRequestDTO,
  UpdateAdminDTO,
} from "@/dto/userDTO";
import BadRequestError from "@/errors/BadRequestError";
import UnauthError from "@/errors/UnauthError";
import { hashPassword } from "@/lib/utils/hash";
import * as userRepository from "@/repositories/userRepository";
import { UpdateUserDTO } from "@/structs/userStruct";
import { USER_ROLE, Users } from "@prisma/client";
import bcrypt from "bcrypt";

export const signupUser = async (data: SignupUserRequestDTO) => {
  const { username, password, contact, email } = data;

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
  const bodyUser = await userRepository.findRoleById(data.id);
  if (!bodyUser || bodyUser.role !== USER_ROLE.ADMIN) {
    throw new UnauthError();
  }
  const updatedAdmin = await userRepository.updateAdminAndApartment(data);

  return updatedAdmin;
};

export const deleteAdmin = async (id: string): Promise<void> => {
  const bodyUser = await userRepository.findRoleById(id);
  if (!bodyUser || bodyUser.role !== USER_ROLE.ADMIN) {
    throw new UnauthError();
  }

  const deleted = await userRepository.deleteById(id);
  if (!deleted) {
    throw new BadRequestError("BadRequestError");
  }
};

export const updateUser = async (
  id: string,
  data: Partial<UpdateUserDTO>
): Promise<Users> => {
  const user = await userRepository.getUserId(id);
  if (!user) {
    throw new UnauthError();
  }

  const { currentPassword, newPassword, profileImage } = data;
  const updateData: Partial<Users> = {};

  if (currentPassword && newPassword) {
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.encryptedPassword
    );

    if (!isPasswordValid) {
      throw new UnauthError();
    }

    const hashedPassword = await hashPassword(newPassword);
    updateData.encryptedPassword = hashedPassword;
  }

  if (profileImage !== undefined) {
    updateData.profileImage = profileImage;
  }
  const updatedUser = await userRepository.updateUser(id, updateData);

  return updatedUser;
};

export const deleteRejectedUsersByRole = async (role: USER_ROLE) => {
  let result;
  if (role === USER_ROLE.SUPER_ADMIN) {
    result = await userRepository.deleteAdmins();
  } else if (role === USER_ROLE.ADMIN) {
    result = await userRepository.deleteUsers();
  } else {
    throw new UnauthError();
  }

  return result;
};

export const approveAdmin = async (bodyId: string, loginId: string) => {
  const user = await userRepository.getUserId(loginId);

  if (!user || user.role !== USER_ROLE.SUPER_ADMIN) {
    throw new UnauthError();
  }

  const bodyUser = await userRepository.findRoleById(bodyId);
  if (!bodyUser || bodyUser.role !== USER_ROLE.ADMIN) {
    throw new UnauthError();
  }

  await userRepository.updateJoinStatustoApproved(bodyId);
};

export const rejectAdmin = async (bodyId: string, loginId: string) => {
  const user = await userRepository.getUserId(loginId);

  if (!user || user.role !== USER_ROLE.SUPER_ADMIN) {
    throw new UnauthError();
  }

  const bodyUser = await userRepository.findRoleById(bodyId);
  if (!bodyUser || bodyUser.role !== USER_ROLE.ADMIN) {
    throw new UnauthError();
  }

  await userRepository.updateJoinStatustoReject(bodyId);
};

export const approveUser = async (bodyId: string, loginId: string) => {
  const user = await userRepository.getUserId(loginId);

  if (!user || user.role !== USER_ROLE.ADMIN) {
    throw new UnauthError();
  }

  const bodyUser = await userRepository.findRoleById(bodyId);
  if (!bodyUser || bodyUser.role !== USER_ROLE.USER) {
    throw new UnauthError();
  }

  await userRepository.updateJoinStatustoApproved(bodyId);
};

export const rejectUser = async (bodyId: string, loginId: string) => {
  const user = await userRepository.getUserId(loginId);

  if (!user || user.role !== USER_ROLE.ADMIN) {
    throw new UnauthError();
  }

  const bodyUser = await userRepository.findRoleById(bodyId);
  if (!bodyUser || bodyUser.role !== USER_ROLE.USER) {
    throw new UnauthError();
  }

  await userRepository.updateJoinStatustoReject(bodyId);
};
