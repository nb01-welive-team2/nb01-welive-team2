import {
  string,
  object,
  enums,
  optional,
  refine,
  nonempty,
  size,
  define,
  nullable,
} from "superstruct";
// import { PageParamsStruct } from "./commonStruct";

export const userSearchKey = ["companyName", "name", "email"] as const;
export type UserSearchKey = (typeof userSearchKey)[number];
const Email = define<string>(
  "Email",
  (value) =>
    typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
);

export const userFilterStruct = object({
  // ...PageParamsStruct.schema,
  searchBy: optional(enums(userSearchKey)),
});

const phoneNumber = refine(
  size(nonempty(string()), 9, 20),
  "phoneNumber",
  (value) => /^0\d{1,2}-\d{3,4}-\d{4}$/.test(value)
);

const password = refine(size(nonempty(string()), 8, 16), "password", (value) =>
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(value)
);

export const createUserBodyStruct = object({
  name: size(nonempty(string()), 1, 10),
  email: Email,
  phoneNumber: phoneNumber,
  password: password,
  passwordConfirmation: password,
  employeeNumber: size(nonempty(string()), 4, 20),
  companyName: size(nonempty(string()), 1, 30),
  companyCode: size(nonempty(string()), 1, 30),
});

export const updateUserBodyStruct = object({
  employeeNumber: size(string(), 4, 20),
  phoneNumber: phoneNumber,
  currentPassword: password,
  password: optional(password),
  passwordConfirmation: optional(password),
  imageUrl: nullable(size(string(), 0, 2048)),
});

export const loginBodyStruct = object({
  email: Email,
  password: password,
});

export const refreshTokenBodyStruct = object({
  refreshToken: nonempty(string()),
});
