import { Admin, ResidentUser, SuperAdmin, UserType } from "@/types/User";
import { JOIN_STATUS, USER_ROLE } from "@prisma/client";

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

  constructor(data: {
    id: string;
    name: string;
    role: USER_ROLE;
    email: string;
    joinStatus: JOIN_STATUS;
    isActive: boolean;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.role = data.role;
    this.email = data.email;
    this.joinStatus = data.joinStatus;
    this.isActive = data.isActive;
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

  constructor(data: {
    id: string;
    name: string;
    email: string;
    role: USER_ROLE;
    username: string;
    contact: string;
    profileImage: string;
    joinStatus: JOIN_STATUS;
    isActive: boolean;
    apartmentId?: string;
    apartmentName?: string;
    apartmentDong?: number;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    this.username = data.username;
    this.contact = data.contact;
    this.avatar = data.profileImage;
    this.joinStatus = data.joinStatus;
    this.isActive = data.isActive;
    this.apartmentId = data.apartmentId;
    this.apartmentName = data.apartmentName;
    this.residentDong = data.apartmentDong;
  }
}
