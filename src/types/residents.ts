import { RESIDENCE_STATUS } from "@prisma/client";
export type ResidentsFilter = {
  building?: number;
  unitNumber?: number;
  residenceStatus?: RESIDENCE_STATUS;
  isRegistered?: boolean;
  name?: string;
  contact?: string;
};
