export type ResidentsFilter = {
  building?: number;
  unitNumber?: number;
  residenceStatus?: "RESIDENCE" | "NO_RESIDENCE";
  isRegistered?: boolean;
  name?: string;
  contact?: string;
};
