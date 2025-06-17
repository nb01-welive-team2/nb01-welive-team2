import {
  coerce,
  integer,
  object,
  string,
  defaulted,
  optional,
  enums,
  nonempty,
  define,
  Infer,
  pattern,
  refine,
} from "superstruct";
import { validate as validateUUID } from "uuid";

export const emailRegExp = pattern(
  string(),
  /^[\w.-]+@([\w.-]+\.)+[\w]{2,4}$/i
);

export const UUID = refine(string(), "UUID", (value) => validateUUID(value));

// export const phoneNumberRegExp = pattern(string(), /^\d{2,3}-\d{3,4}-\d{4}$/);

export const integerString = coerce(integer(), string(), (value) =>
  parseInt(value)
);

// const urlRegExp = /^(https?:\/\/)/;

// export const PageParamsStruct = object({
//   page: defaulted(integerString, 1),
//   pageSize: defaulted(integerString, 10),
//   searchBy: optional(string()),
//   keyword: optional(string()),
// });
// export type PageParamsType = Infer<typeof PageParamsStruct>;

// export const SearchParamsStruct = object({
//   searchBy: nonempty(string()),
//   keyword: optional(string()),
// });
// export type SearchParamsType = Infer<typeof SearchParamsStruct>;
