import { RESIDENCE_STATUS } from "@prisma/client";
import { ResidentsFilter } from "@/types/residents";

export function parseResidentsQuery(query: any): ResidentsFilter {
  return {
    apartmentId: query.apartmentId ?? "",
    building: query.building ? Number(query.building) : undefined,
    unitNumber: query.unitNumber ? Number(query.unitNumber) : undefined,
    residenceStatus: query.residenceStatus as RESIDENCE_STATUS,
    isRegistered:
      query.isRegistered === "true"
        ? true
        : query.isRegistered === "false"
          ? false
          : undefined,
    name: query.name,
    contact: query.contact,
  };
}
