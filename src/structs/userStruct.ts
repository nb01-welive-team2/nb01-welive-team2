import {
  string,
  object,
  enums,
  optional,
  refine,
  nonempty,
  size,
  Infer,
  pattern,
  nullable,
  boolean,
  coerce,
} from "superstruct";

const strictEmailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const PASSWORD_REGEX = /^[\s\S]{8,128}$/;
const password = refine(string(), "Password", (value) => {
  return PASSWORD_REGEX.test(value);
});
const mobileNumber = /^010\d{8}$/;
const tellNumber = /^(01[016789]|02|0[3-6][0-9])\-?\d{3,4}\-?\d{4}$/;

export const loginBodyStruct = object({
  username: size(nonempty(string()), 1, 20),
  password: nonempty(password),
});

export type LoginRequestDTO = Infer<typeof loginBodyStruct>;

const baseUserStruct = object({
  username: size(nonempty(string()), 5, 30),
  password: nonempty(password),
  contact: pattern(string(), mobileNumber),
  name: nonempty(string()),
  email: pattern(string(), strictEmailRegex),
  role: enums(["USER", "ADMIN", "SUPER_ADMIN"]),
  profileImage: optional(size(string(), 0, 2048)),
  isActive: optional(require("superstruct").defaulted(boolean(), true)),
});

export const signupUserStruct = object({
  ...baseUserStruct.schema,
  apartmentName: nonempty(string()),
  apartmentDong: size(nonempty(string()), 1, 2),
  apartmentHo: size(nonempty(string()), 1, 2),
});

export const signupAdminStruct = object({
  ...baseUserStruct.schema,
  apartmentName: nonempty(string()),
  apartmentAddress: nonempty(string()),
  apartmentManagementNumber: pattern(string(), tellNumber),
  description: nonempty(string()),
  startComplexNumber: size(nonempty(string()), 1, 2),
  endComplexNumber: size(nonempty(string()), 1, 2),
  startDongNumber: size(nonempty(string()), 1, 2),
  endDongNumber: size(nonempty(string()), 1, 2),
  startFloorNumber: size(nonempty(string()), 1, 2),
  endFloorNumber: size(nonempty(string()), 1, 2),
  startHoNumber: size(nonempty(string()), 1, 2),
  endHoNumber: size(nonempty(string()), 1, 2),
});

export const signupSuperAdminStruct = object({
  ...baseUserStruct.schema,
  joinStatus: enums(["APPROVED"]),
});

export const updateAdminStruct = object({
  id: nonempty(string()),
  contact: pattern(string(), /^010\d{8}$/),
  name: nonempty(string()),
  email: pattern(string(), strictEmailRegex),
  description: nonempty(string()),
  apartmentName: nonempty(string()),
  apartmentAddress: nonempty(string()),
  apartmentManagementNumber: pattern(string(), tellNumber),
});

const PasswordStruct = object({
  currentPassword: nonempty(password),
  newPassword: nonempty(password),
});

export const UpdatePasswordBodyStruct = PasswordStruct;
export type UpdatePasswordDTO = Infer<typeof UpdatePasswordBodyStruct>;

const EmptyToUndefinedPassword = coerce(
  optional(password),
  string(),
  (value) => (value === "" ? undefined : value)
);

export const UpdateUserBodyStruct = object({
  currentPassword: EmptyToUndefinedPassword,
  newPassword: EmptyToUndefinedPassword,
  profileImage: optional(nullable(string())),
});

export type UpdateUserDTO = Infer<typeof UpdateUserBodyStruct>;
