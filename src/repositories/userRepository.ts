import { prisma } from "../lib/prisma";
import {
  SignupAdminRequestDTO,
  SignupSuperAdminRequestDTO,
  SignupUserRequestDTO,
  UpdateAdminDTO,
} from "@/dto/userDTO";
import { JOIN_STATUS, USER_ROLE, Users } from "@prisma/client";

export const getUserByUsername = async (username: string) => {
  const user = await prisma.users.findUnique({
    where: { username },
    include: {
      apartmentInfo: {
        select: {
          id: true,
          apartmentName: true,
          userInfo: { select: { apartmentDong: true } },
        },
      },
      userInfo: {
        select: {
          id: true,
          apartmentId: true,
          apartmentDong: true,
          apartmentName: true,
        },
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

  const user = await prisma.users.create({
    data: {
      id: input.id,
      username: input.username,
      encryptedPassword: input.password,
      contact: input.contact,
      name: input.name,
      email: input.email,
      role: USER_ROLE.USER,
      profileImage: input.profileImage,
      joinStatus: JOIN_STATUS.PENDING,
      userInfo: {
        create: {
          apartmentName: input.apartmentName,
          apartmentDong: input.apartmentDong,
          apartmentHo: input.apartmentHo,
          apartmentInfo: {
            connect: { id: apartment!.id },
          },
        },
      },
    },
    select: {
      id: true,
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
      id: input.id,
      username: input.username,
      encryptedPassword: input.password,
      contact: input.contact,
      name: input.name,
      email: input.email,
      role: USER_ROLE.ADMIN,
      profileImage: input.profileImage,
      joinStatus: JOIN_STATUS.PENDING,
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
          approvalStatus: JOIN_STATUS.PENDING,
        },
      },
    },
    select: {
      id: true,
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
      id: input.id,
      username: input.username,
      encryptedPassword: input.password,
      contact: input.contact,
      name: input.name,
      email: input.email,
      role: USER_ROLE.SUPER_ADMIN,
      profileImage: input.profileImage,
      joinStatus: JOIN_STATUS.APPROVED,
    },
  });

  return user;
};

export const findApartment = async (apartmentName: string) => {
  const data = await prisma.apartmentInfo.findFirst({
    where: { apartmentName },
  });

  return data;
};

export const updateAdminAndApartment = async (data: UpdateAdminDTO) => {
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

  await prisma.$transaction([
    prisma.users.update({
      where: { id },
      data: { contact, name, email },
    }),
    prisma.apartmentInfo.updateMany({
      where: { userId: id },
      data: {
        description,
        apartmentName,
        apartmentAddress,
        apartmentManagementNumber,
      },
    }),
  ]);

  return data;
};

export const deleteById = async (id: string) => {
  const deleted = await prisma.users.delete({
    where: { id },
  });
  return deleted;
};

export const updateUser = async (id: string, data: Partial<Users>) => {
  const updatedUser = await prisma.users.update({
    where: { id },
    data,
  });
  return updatedUser;
};

export const deleteAdmins = async () => {
  return await prisma.users.deleteMany({
    where: {
      role: USER_ROLE.ADMIN,
      joinStatus: JOIN_STATUS.REJECTED,
    },
  });
};

export const deleteUsers = async () => {
  return await prisma.users.deleteMany({
    where: {
      role: USER_ROLE.USER,
      joinStatus: JOIN_STATUS.REJECTED,
    },
  });
};

export const findRoleById = async (id: string) => {
  return await prisma.users.findUnique({
    where: { id },
    select: {
      role: true,
    },
  });
};

export const updateJoinStatustoApproved = async (id: string) => {
  return await prisma.users.update({
    where: { id },
    data: {
      joinStatus: JOIN_STATUS.APPROVED,
    },
  });
};

export const updateJoinStatustoReject = async (id: string) => {
  return await prisma.users.update({
    where: { id },
    data: {
      joinStatus: JOIN_STATUS.REJECTED,
    },
  });
};

export const updateJoinStatustoApprovedAllAdmins = async () => {
  return await prisma.users.updateMany({
    where: {
      role: USER_ROLE.ADMIN,
      joinStatus: { not: JOIN_STATUS.APPROVED },
    },
    data: {
      joinStatus: JOIN_STATUS.APPROVED,
    },
  });
};

export const updateJoinStatustoRejectAllAdmins = async () => {
  return await prisma.users.updateMany({
    where: {
      role: USER_ROLE.ADMIN,
      joinStatus: { not: JOIN_STATUS.REJECTED },
    },
    data: {
      joinStatus: JOIN_STATUS.REJECTED,
    },
  });
};

export const updateJoinStatustoApprovedAllUsers = async () => {
  return await prisma.users.updateMany({
    where: {
      role: USER_ROLE.USER,
      joinStatus: { not: JOIN_STATUS.APPROVED },
    },
    data: {
      joinStatus: JOIN_STATUS.APPROVED,
    },
  });
};

export const updateJoinStatustoRejectAllUsers = async () => {
  return await prisma.users.updateMany({
    where: {
      role: USER_ROLE.USER,
      joinStatus: { not: JOIN_STATUS.REJECTED },
    },
    data: {
      joinStatus: JOIN_STATUS.REJECTED,
    },
  });
};
