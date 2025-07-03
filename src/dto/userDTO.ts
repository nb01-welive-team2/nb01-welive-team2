import { Admin, ResidentUser, SuperAdmin, UserType } from "@/types/User";
import {
  ApartmentInfo,
  JOIN_STATUS,
  USER_ROLE,
  UserInfo,
  Users,
} from "@prisma/client";

export interface userRequestDTO {
  id?: string;
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

export interface UpdateAdminDTO {
  contact: string;
  name: string;
  email: string;
  description: string;
  apartmentName: string;
  apartmentAddress: string;
  apartmentManagementNumber: string;
  id: string;
}

export class SignupResponseDTO {
  id: string;
  name: string;
  role: USER_ROLE;
  email: string;
  joinStatus: JOIN_STATUS;
  isActive: boolean;

  constructor(
    user: Pick<Users, "id" | "name" | "role" | "email" | "joinStatus">
  ) {
    this.id = user.id;
    this.name = user.name;
    this.role = user.role;
    this.email = user.email;
    this.joinStatus = user.joinStatus;
    this.isActive = true;
  }
}

export class loginResponseDTO {
  id: string;
  name: string;
  email: string;
  role: USER_ROLE;
  username: string;
  contact: string;
  avatar: string;
  joinStatus: JOIN_STATUS;
  isActive: boolean;
  apartmentId?: string;
  apartmentName?: string;
  residentDong?: number;

  constructor(
    user: Users & {
      apartmentInfo?: { id: string; apartmentName: string } | null;
    } & {
      userInfo?: {
        apartmentId: string;
        apartmentName: string;
        apartmentDong: number;
      } | null;
    }
  ) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.username = user.username;
    this.contact = user.contact;
    this.avatar = user.profileImage ?? "";
    this.joinStatus = user.joinStatus;
    this.isActive = true;
    this.apartmentId = user.apartmentInfo?.id ?? user.userInfo?.apartmentId;
    this.apartmentName =
      user.apartmentInfo?.apartmentName ?? user.userInfo?.apartmentName;
    this.residentDong = user.userInfo?.apartmentDong;
  }
}
