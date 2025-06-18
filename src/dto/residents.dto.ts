import { RESIDENCE_STATUS } from "@prisma/client";

export interface CreateOneResidentDto {
  building: number;
  unitNumber: number;
  contact: string;
  name: string;
  isHouseholder: RESIDENCE_STATUS;
}
