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

export const integerString1 = coerce(integer(), optional(string()), (value) => {
  if (!value) return 1;
  return parseInt(value);
});

export const integerString11 = coerce(
  integer(),
  optional(string()),
  (value) => {
    if (!value) return 11;
    return parseInt(value);
  }
);

export const searchKeywordStruct = coerce(
  string(),
  optional(string()),
  (value) => {
    if (!value) return "";
    return value.trim();
  }
);

export const DateTimeStringStruct = define<string>(
  "DateTimeString",
  (value) => {
    if (typeof value !== "string") return false;

    const date = new Date(value);
    return (
      !isNaN(date.getTime()) &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
    );
  }
);

export const PageParamsStruct = object({
  page: defaulted(integerString, 1),
  limit: defaulted(integerString, 11),
});
export type PageParamsType = Infer<typeof PageParamsStruct>;

// export const SearchParamsStruct = object({
//   searchBy: nonempty(string()),
//   keyword: optional(string()),
// });
// export type SearchParamsType = Infer<typeof SearchParamsStruct>;
