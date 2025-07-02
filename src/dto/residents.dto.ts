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

interface ResidentResponseDtoProps {
  id: string;
  name: string;
  apartmentId: string;
  building: number;
  unitNumber: number;
  contact: string;
  email: string;
  residenceStatus: RESIDENCE_STATUS;
  isHouseholder: HOUSEHOLDER_STATUS;
  isRegistered: boolean;
  approvalStatus: APPROVAL_STATUS;
}

export class ResidentResponseDto implements ResidentResponseDtoProps {
  id: string;
  name: string;
  apartmentId: string;
  building: number;
  unitNumber: number;
  contact: string;
  email: string;
  residenceStatus: RESIDENCE_STATUS;
  isHouseholder: HOUSEHOLDER_STATUS;
  isRegistered: boolean;
  approvalStatus: APPROVAL_STATUS;

  constructor(props: ResidentResponseDtoProps) {
    this.id = props.id;
    this.name = props.name;
    this.apartmentId = props.apartmentId;
    this.building = props.building;
    this.unitNumber = props.unitNumber;
    this.contact = props.contact;
    this.email = props.email;
    this.residenceStatus = props.residenceStatus;
    this.isHouseholder = props.isHouseholder;
    this.isRegistered = props.isRegistered;
    this.approvalStatus = props.approvalStatus;
  }
}

interface ResidentsListResponseDtoProps {
  id: string;
  name: string;
  apartmentId: string;
  building: number;
  unitNumber: number;
  contact: string;
  email: string;
  residenceStatus: RESIDENCE_STATUS;
  isRegistered: boolean;
  approvalStatus: APPROVAL_STATUS;
  isHouseholder: HOUSEHOLDER_STATUS;
}

export class ResidentsListResponseDto implements ResidentsListResponseDtoProps {
  id: string;
  name: string;
  apartmentId: string;
  building: number;
  unitNumber: number;
  contact: string;
  email: string;
  residenceStatus: RESIDENCE_STATUS;
  isRegistered: boolean;
  approvalStatus: APPROVAL_STATUS;
  isHouseholder: HOUSEHOLDER_STATUS;

  constructor(props: ResidentsListResponseDtoProps) {
    this.id = props.id;
    this.name = props.name;
    this.apartmentId = props.apartmentId;
    this.building = props.building;
    this.unitNumber = props.unitNumber;
    this.contact = props.contact;
    this.email = props.email;
    this.residenceStatus = props.residenceStatus;
    this.isRegistered = props.isRegistered;
    this.approvalStatus = props.approvalStatus;
    this.isHouseholder = props.isHouseholder;
  }
}
