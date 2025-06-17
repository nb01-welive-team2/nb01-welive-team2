type USER_ROLE = "SUPER_ADMIN" | "ADMIN" | "USER";
type JOIN_STATUS = "APPROVED" | "PENDING" | "REJECTED";
type APPROVAL_STATUS = "APPROVED" | "PENDING" | "REJECTED";

interface BaseUser {
  id: string;
  username: string;
  encryptedPassword: string;
  contact: string;
  name: string;
  email: string;
  role: USER_ROLE;
  joinStatus: JOIN_STATUS;
  profileImage?: string;
}

interface UserInfo {
  id: string;
  userId: string;
  apartmentId: string;
  apartmentName: string;
  apartmentDong: number;
  apartmentHo: number;
}

interface ApartmentInfo {
  id: string;
  userId: string;
  approvalStatus: APPROVAL_STATUS;
  apartmentName: string;
  apartmentAddress: string;
  apartmentManagementNumber: string;
  description?: string;
  startComplexNumber?: number;
  endComplexNumber?: number;
  startDongNumber: number;
  endDongNumber: number;
  startFloorNumber: number;
  endFloorNumber: number;
  startHoNumber: number;
  endHoNumber: number;
  createdAt: Date;
}

interface SuperAdmin extends BaseUser {
  role: "SUPER_ADMIN";
  joinStatus: "APPROVED";
}

interface Admin extends BaseUser {
  role: "ADMIN";
  apartmentInfo: ApartmentInfo[];
}

interface ResidentUser extends BaseUser {
  role: "USER";
  userInfo: UserInfo[];
}

export type UserType = SuperAdmin | Admin | ResidentUser;
