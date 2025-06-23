import { Admin, ResidentUser, SuperAdmin, UserType } from "@/types/User";
import { JOIN_STATUS, USER_ROLE } from "@prisma/client";

export interface userRequestDTO {
  username: string;
  password: string;
  contact: string;
  name: string;
  email: string;
  role: USER_ROLE;
  profileImage?: string;
}

export interface SignupUserRequestDTO extends userRequestDTO {
  apartmentName: string;
  apartmentDong: number;
  apartmentHo: number;
}

export interface SignupAdminRequestDTO extends userRequestDTO {
  description: string;
  startComplexNumber: number;
  endComplexNumber: number;
  startDongNumber: number;
  endDongNumber: number;
  startFloorNumber: number;
  endFloorNumber: number;
  startHoNumber: number;
  endHoNumber: number;
  apartmentName: string;
  apartmentAddress: string;
  apartmentManagementNumber: string;
}

export interface SignupSuperAdminRequestDTO extends userRequestDTO {
  joinStatus: JOIN_STATUS;
}

export const userResponseDTO = (user: UserType) => {
  if (user.role === "USER") {
    const { encryptedPassword, joinStatus, userInfo, profileImage, ...rest } =
      user as ResidentUser;
    return {
      ...rest,
      ...(userInfo || {}),
    };
  }

  if (user.role === "ADMIN") {
    const {
      encryptedPassword,
      joinStatus,
      apartmentInfo,
      profileImage,
      ...rest
    } = user as Admin;

    const { ...flattenedApt } = apartmentInfo || {};

    return {
      ...rest,
      ...flattenedApt,
    };
  }

  if (user.role === "SUPER_ADMIN") {
    const { encryptedPassword, profileImage, ...rest } = user as SuperAdmin;
    return {
      ...rest,
    };
  }

  return {};
};
