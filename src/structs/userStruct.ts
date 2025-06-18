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
  Infer,
} from "superstruct";
// import { PageParamsStruct } from "./commonStruct";

const Email = define<string>(
  "Email",
  (value) =>
    typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
);

export const contact = refine(
  size(nonempty(string()), 9, 11),
  "contact",
  (value) => /^\d+$/.test(value) && value.startsWith("0")
);

const PASSWORD_REGEX = /^[\s\S]{8,128}$/;
const password = refine(string(), "Password", (value) => {
  return PASSWORD_REGEX.test(value);
});

export const createUserBodyStruct = object({
  name: size(nonempty(string()), 1, 10),
  email: Email,
  contact: contact,
  encryptedPassword: password,
  passwordConfirmation: password,
  employeeNumber: size(nonempty(string()), 4, 20),
  companyName: size(nonempty(string()), 1, 30),
  companyCode: size(nonempty(string()), 1, 30),
});

export const loginBodyStruct = object({
  username: size(nonempty(string()), 1, 20),
  password: password,
});

export type LoginRequestDTO = Infer<typeof loginBodyStruct>;

export const refreshTokenBodyStruct = object({
  refreshToken: nonempty(string()),
});
