import {
  object,
  string,
  number,
  enums,
  optional,
  boolean,
  size,
} from "superstruct";

const RESIDENCE_STATUS = ["RESIDENCE", "NO_RESIDENCE"] as const;
const HOUSEHOLDER_STATUS = ["HOUSEHOLDER", "MEMBER"] as const;
const APPROVAL_STATUS = ["UNRECEIVED", "PENDING", "APPROVED"] as const;

export const createResidentBodyStruct = object({
  building: number(),
  unitNumber: number(),
  contact: size(string(), 10, 20),
  name: size(string(), 1, 15),
  email: optional(size(string(), 5, 320)),
  isHouseholder: enums(["HOUSEHOLDER", "MEMBER"]),
});

export const UpdateResidentBodyStruct = object({
  building: optional(number()),
  unitNumber: optional(number()),
  contact: optional(size(string(), 10, 20)),
  name: optional(size(string(), 1, 15)),
  email: optional(size(string(), 5, 320)),
  residenceStatus: optional(enums(RESIDENCE_STATUS)),
  isHouseholder: optional(enums(HOUSEHOLDER_STATUS)),
  isRegistered: optional(boolean()),
  approvalStatus: optional(enums(APPROVAL_STATUS)),
});
