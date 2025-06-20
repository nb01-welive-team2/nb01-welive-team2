import { Prisma } from "@prisma/client";
import {
  RESIDENCE_STATUS,
  HOUSEHOLDER_STATUS,
  APPROVAL_STATUS,
} from "@prisma/client";

export interface CreateOneResidentDto {
  building: number;
  unitNumber: number;
  contact: string;
  name: string;
  isHouseholder: RESIDENCE_STATUS;
}

export interface UpdateResidentDataDto {
  building?: number;
  unitNumber?: number;
  contact?: string;
  name?: string;
  email?: string;
  residenceStatus?: RESIDENCE_STATUS;
  isHouseholder?: HOUSEHOLDER_STATUS;
  isRegistered?: boolean;
  approvalStatus?: APPROVAL_STATUS;
}

export type ResidentUploadInputDto = {
  name: string;
  email: string;
  contact: string;
  building: number;
  unitNumber: number;
  isHouseholder: Prisma.ResidentsCreateInput["isHouseholder"];
  apartmentId: string;
};
