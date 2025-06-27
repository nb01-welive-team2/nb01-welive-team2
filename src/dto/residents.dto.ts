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

export type UploadResidentsInput = {
  name: string;
  building: number;
  unitNumber: number;
  contact: string;
  email: string;
  apartmentId: string;
  isHouseholder: HOUSEHOLDER_STATUS;
};

export class ResidentResponseDto {
  id!: string;
  name!: string;
  apartmentId!: string;
  building!: number;
  unitNumber!: number;
  contact!: string;
  email!: string;
  residenceStatus!: RESIDENCE_STATUS;
  isHouseholder!: HOUSEHOLDER_STATUS;
  isRegistered!: boolean;
  approvalStatus!: APPROVAL_STATUS;

  constructor(partial: Partial<ResidentResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ResidentsListResponseDto {
  id!: string;
  name!: string;
  apartmentId!: string;
  building!: number;
  unitNumber!: number;
  contact!: string;
  email!: string;
  residenceStatus!: RESIDENCE_STATUS;
  isRegistered!: boolean;
  approvalStatus!: APPROVAL_STATUS;
  isHouseholder!: HOUSEHOLDER_STATUS;

  constructor(partial: Partial<ResidentsListResponseDto>) {
    Object.assign(this, partial);
  }
}

export class UpdateResidentResponseDto {
  name?: string;
  contact?: string;
  email?: string;
  residenceStatus?: RESIDENCE_STATUS;
  isHouseholder?: HOUSEHOLDER_STATUS;
  isRegistered?: boolean;
  approvalStatus?: APPROVAL_STATUS;

  constructor(partial: Partial<UpdateResidentResponseDto>) {
    Object.assign(this, partial);
  }
}
