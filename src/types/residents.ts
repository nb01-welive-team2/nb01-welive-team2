import { Prisma } from "@prisma/client";
import { RESIDENCE_STATUS } from "@prisma/client";

export type ResidentsFilter = {
  building?: number;
  unitNumber?: number;
  residenceStatus?: RESIDENCE_STATUS;
  isRegistered?: boolean;
  name?: string;
  contact?: string;
};

export type ResidentUploadInput = {
  name: string;
  email: string;
  contact: string;
  building: number;
  unitNumber: number;
  isHouseholder: Prisma.ResidentsCreateInput["isHouseholder"];
  apartmentInfo: Prisma.ResidentsCreateInput["apartmentInfo"];
};
