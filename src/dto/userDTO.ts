import { Admin, ResidentUser, SuperAdmin, UserType } from "@/types/User";
import { USER_ROLE } from "@prisma/client";

export interface SignupUserRequestDTO {
  username: string;
  password: string;
  contact: string;
  name: string;
  email: string;
  role: USER_ROLE;
  profileImage: string | null;
  apartmentName: string;
  apartmentDong: number;
  apartmentHo: number;
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
    return {
      ...rest,
      ...(apartmentInfo || {}),
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
