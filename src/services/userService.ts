import { SignupAdminRequestDTO, SignupUserRequestDTO } from "@/dto/userDTO";
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

export const signupAdmin = async (data: SignupAdminRequestDTO) => {
  const {
    username,
    password,
    contact,
    email,
    startComplexNumber,
    endComplexNumber,
    startDongNumber,
    endDongNumber,
    startFloorNumber,
    endFloorNumber,
    startHoNumber,
    endHoNumber,
  } = data;

  await userRepository.usersUniqueColums(username, contact, email);

  const encryptedPassword = await hashPassword(password);
  const user = {
    ...data,
    password: encryptedPassword,
    startComplexNumber: Number(startComplexNumber),
    endComplexNumber: Number(endComplexNumber),
    startDongNumber: Number(startDongNumber),
    endDongNumber: Number(endDongNumber),
    startFloorNumber: Number(startFloorNumber),
    endFloorNumber: Number(endFloorNumber),
    startHoNumber: Number(startHoNumber),
    endHoNumber: Number(endHoNumber),
  };

  const signupUser = await userRepository.createAdmin(user);

  return signupUser;
};
