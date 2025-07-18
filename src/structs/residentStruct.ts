import {
  object,
  string,
  number,
  enums,
  optional,
  boolean,
  size,
} from "superstruct";
import {
  RESIDENCE_STATUS,
  HOUSEHOLDER_STATUS,
  APPROVAL_STATUS,
} from "@prisma/client";

export const createResidentBodyStruct = object({
  building: number(),
  unitNumber: number(),
  contact: size(string(), 10, 20),
  name: size(string(), 1, 15),
  email: optional(size(string(), 5, 320)),
  isHouseholder: enums(Object.values(HOUSEHOLDER_STATUS)),
});

export const UpdateResidentBodyStruct = object({
  building: optional(number()),
  unitNumber: optional(number()),
  contact: optional(size(string(), 10, 20)),
  name: optional(size(string(), 1, 15)),
  email: optional(size(string(), 5, 320)),
  residenceStatus: optional(enums(Object.values(RESIDENCE_STATUS))),
  isHouseholder: optional(enums(Object.values(HOUSEHOLDER_STATUS))),
  isRegistered: optional(boolean()),
  approvalStatus: optional(enums(Object.values(APPROVAL_STATUS))),
});
