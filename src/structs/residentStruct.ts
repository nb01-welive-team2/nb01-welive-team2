import {
  object,
  string,
  number,
  enums,
  optional,
  boolean,
  size,
  pattern,
} from "superstruct";

const RESIDENCE_STATUS = ["RESIDENCE", "NO_RESIDENCE"] as const;
const HOUSEHOLDER_STATUS = ["HOUSEHOLDER", "MEMBER"] as const;
const APPROVAL_STATUS = ["UNRECEIVED", "PENDING", "APPROVED"] as const;

const phoneRegex = /^010-\d{4}-\d{4}$/;

export const createResidentBodyStruct = object({
  building: number(),
  unitNumber: number(),
  contact: pattern(size(string(), 10, 20), phoneRegex),
  name: size(string(), 50),
  email: optional(size(string(), 5, 320)),
  isHouseholder: enums(["HOUSEHOLDER", "MEMBER"]),
});

export const UpdateResidentBodyStruct = object({
  building: optional(number()),
  unitNumber: optional(number()),
  contact: pattern(size(string(), 10, 20), phoneRegex),
  name: size(string(), 50),
  email: optional(size(string(), 5, 320)),
  residenceStatus: optional(enums(RESIDENCE_STATUS)),
  isHouseholder: optional(enums(HOUSEHOLDER_STATUS)),
  isRegistered: optional(boolean()),
  approvalStatus: optional(enums(APPROVAL_STATUS)),
});
