import { object, string, number, enums, optional, boolean } from "superstruct";

const RESIDENCE_STATUS = ["RESIDENCE", "NO_RESIDENCE"] as const;
const HOUSEHOLDER_STATUS = ["HOUSEHOLDER", "MEMBER"] as const;
const APPROVAL_STATUS = ["UNRECEIVED", "PENDING", "APPROVED"] as const;

export const createResidentBodyStruct = object({
  building: number(),
  unitNumber: number(),
  contact: string(),
  name: string(),
  email: optional(string()),
  isHouseholder: enums(["HOUSEHOLDER", "MEMBER"]),
});

export const UpdateResidentBodyStruct = object({
  building: optional(number()),
  unitNumber: optional(number()),
  contact: optional(string()),
  name: optional(string()),
  email: optional(string()),
  residenceStatus: optional(enums(RESIDENCE_STATUS)),
  isHouseholder: optional(enums(HOUSEHOLDER_STATUS)),
  isRegistered: optional(boolean()),
  approvalStatus: optional(enums(APPROVAL_STATUS)),
});
