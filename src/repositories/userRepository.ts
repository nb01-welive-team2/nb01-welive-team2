import { UserType } from "@/types/User";
import { prisma } from "../lib/prisma";
import BadRequestError from "@/errors/BadRequestError";
import {
  SignupAdminRequestDTO,
  SignupSuperAdminRequestDTO,
  SignupUserRequestDTO,
  UpdateAdminDTO,
} from "@/dto/userDTO";

export const getUserByUsername = async (username: string) => {
  const user = await prisma.users.findUnique({
    where: { username },
    include: {
      apartmentInfo: {
        select: { id: true },
      },
      userInfo: {
        select: { id: true, apartmentId: true },
      },
    },
  });

  return user;
};

export const getUserId = async (id: string) => {
  const user = await prisma.users.findUnique({
    where: { id },
    include: {
      apartmentInfo: {
        select: { id: true },
      },
    },
  });
  return user;
};

export const createUser = async (input: SignupUserRequestDTO) => {
  const apartment = await findApartment(input.apartmentName); // TODO: 프로젝트 합친 후 apartment관련 리포지토리 있으면 거기에 맞춰 수정
  if (!apartment) throw new BadRequestError("존재하지 않는 아파트입니다.");

  const user = await prisma.users.create({
    data: {
      username: input.username,
      encryptedPassword: input.password,
      contact: input.contact,
      name: input.name,
      email: input.email,
      role: "USER",
      profileImage: input.profileImage,
      joinStatus: "PENDING",
      userInfo: {
        create: {
          apartmentName: input.apartmentName,
          apartmentDong: input.apartmentDong,
          apartmentHo: input.apartmentHo,
          apartmentInfo: {
            connect: { id: apartment.id },
          },
        },
      },
    },
    select: {
      username: true,
      encryptedPassword: true,
      contact: true,
      name: true,
      email: true,
      role: true,
      profileImage: true,
      joinStatus: true,
      userInfo: {
        select: {
          apartmentName: true,
          apartmentDong: true,
          apartmentHo: true,
        },
      },
    },
  });

  return user;
};

export const createAdmin = async (input: SignupAdminRequestDTO) => {
  const user = await prisma.users.create({
    data: {
      username: input.username,
      encryptedPassword: input.password,
      contact: input.contact,
      name: input.name,
      email: input.email,
      role: "ADMIN",
      profileImage: input.profileImage,
      joinStatus: "PENDING",
      apartmentInfo: {
        create: {
          description: input.description,
          startComplexNumber: input.startComplexNumber,
          endComplexNumber: input.endComplexNumber,
          startDongNumber: input.startDongNumber,
          endDongNumber: input.endDongNumber,
          startFloorNumber: input.startFloorNumber,
          endFloorNumber: input.endFloorNumber,
          startHoNumber: input.startHoNumber,
          endHoNumber: input.endHoNumber,
          apartmentName: input.apartmentName,
          apartmentAddress: input.apartmentAddress,
          apartmentManagementNumber: input.apartmentManagementNumber,
          approvalStatus: "PENDING",
        },
      },
    },
    select: {
      username: true,
      encryptedPassword: true,
      contact: true,
      name: true,
      email: true,
      role: true,
      profileImage: true,
      joinStatus: true,
      apartmentInfo: {
        select: {
          description: true,
          startComplexNumber: true,
          endComplexNumber: true,
          startDongNumber: true,
          endDongNumber: true,
          startFloorNumber: true,
          endFloorNumber: true,
          startHoNumber: true,
          endHoNumber: true,
          apartmentName: true,
          apartmentAddress: true,
          apartmentManagementNumber: true,
        },
      },
    },
  });

  return user;
};

export const createSuperAdmin = async (input: SignupSuperAdminRequestDTO) => {
  const user = await prisma.users.create({
    data: {
      username: input.username,
      encryptedPassword: input.password,
      contact: input.contact,
      name: input.name,
      email: input.email,
      role: "SUPER_ADMIN",
      profileImage: input.profileImage,
      joinStatus: "APPROVED",
    },
  });

  return user;
};

// export const findUserEmail = async (email: string) => {
//   const data = await prisma.users.findUnique({
//     where: { email },
//   });

//   return data;
// };

export const usersUniqueColums = async (
  username: string,
  contact: string,
  email: string
) => {
  const exists = await prisma.users.findFirst({
    where: {
      OR: [{ username }, { contact }, { email }],
    },
  });

  if (exists) throw new BadRequestError("이미 등록된 사용자입니다.");
};

export const findApartment = async (apartmentName: string) => {
  const data = await prisma.apartmentInfo.findFirst({
    where: { apartmentName },
  });

  return data;
};

export const updateAdmin = async (data: UpdateAdminDTO) => {
  const {
    id,
    contact,
    name,
    email,
    description,
    apartmentName,
    apartmentAddress,
    apartmentManagementNumber,
  } = data;

  await prisma.users.update({
    where: { id },
    data: { contact, name, email },
  });

  await prisma.apartmentInfo.updateMany({
    where: { userId: id },
    data: {
      description,
      apartmentName,
      apartmentAddress,
      apartmentManagementNumber,
    },
  });

  return data;
};
