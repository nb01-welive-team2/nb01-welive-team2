import { Admin, ResidentUser, SuperAdmin, UserType } from "@/types/User";
import { USER_ROLE } from "@prisma/client";

export interface userRequestDTO {
  username: string;
  password: string;
  contact: string;
  name: string;
  email: string;
  role: USER_ROLE;
  profileImage: string | null;
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

export const userResponseDTO = (user: UserType) => {
  if (user.role === "USER") {
    const { encryptedPassword, joinStatus, userInfo, ...rest } =
      user as ResidentUser;
    return {
      ...rest,
      ...(userInfo || {}),
    };
  }

  if (user.role === "ADMIN") {
    const { encryptedPassword, joinStatus, apartmentInfo, ...rest } =
      user as Admin;

    const { ...flattenedApt } = apartmentInfo || {};

    return {
      ...rest,
      ...flattenedApt,
    };
  }

  if (user.role === "SUPER_ADMIN") {
    const { encryptedPassword, ...rest } = user as SuperAdmin;
    return {
      ...rest,
    };
  }

  return {};
};
