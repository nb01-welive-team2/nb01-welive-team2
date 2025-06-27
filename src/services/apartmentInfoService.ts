import apartmentInfoRepository from "@/repositories/apartmentInfoRepository";
import { Prisma } from "@prisma/client";
import NotFoundError from "@/errors/NotFoundError";

async function getApartmentsList(
  query: {
    apartmentName?: string;
    apartmentAddress?: string;
  },
  isAuthenticated: boolean
) {
  const where = {
    ...(query.apartmentName && {
      apartmentName: {
        contains: query.apartmentName,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    ...(query.apartmentAddress && {
      apartmentAddress: {
        contains: query.apartmentAddress,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
  };

  const apartments = await apartmentInfoRepository.findApartmentsList(where);

  return apartments.map((apt) =>
    isAuthenticated
      ? {
          id: apt.id,
          name: apt.apartmentName,
          address: apt.apartmentAddress,
          officeNumber: apt.apartmentManagementNumber,
          description: apt.description,
          dongRange: {
            start: apt.startDongNumber,
            end: apt.endDongNumber,
          },
          hoRange: {
            start: apt.startHoNumber,
            end: apt.endHoNumber,
          },
          startComplexNumber: apt.startComplexNumber,
          endComplexNumber: apt.endComplexNumber,
          startDongNumber: apt.startDongNumber,
          endDongNumber: apt.endDongNumber,
          startFloorNumber: apt.startFloorNumber,
          endFloorNumber: apt.endFloorNumber,
          startHoNumber: apt.startHoNumber,
          endHoNumber: apt.endHoNumber,
          apartmentStatus: apt.approvalStatus,
        }
      : {
          id: apt.id,
          name: apt.apartmentName,
          address: apt.apartmentAddress,
        }
  );
}

async function getApartmentDetail(id: string) {
  const apartment = await apartmentInfoRepository.findById(id);
  if (!apartment) {
    throw new NotFoundError("아파트를 찾을 수 없습니다.", id);
  }

  return {
    id: apartment.id,
    name: apartment.apartmentName,
    address: apartment.apartmentAddress,
    startComplexNumber: apartment.startComplexNumber,
    endComplexNumber: apartment.endComplexNumber,
    startDongNumber: apartment.startDongNumber,
    endDongNumber: apartment.endDongNumber,
    startFloorNumber: apartment.startFloorNumber,
    endFloorNumber: apartment.endFloorNumber,
    startHoNumber: apartment.startHoNumber,
    endHoNumber: apartment.endHoNumber,
    dongRange: {
      start: apartment.startDongNumber,
      end: apartment.endDongNumber,
    },
    hoRange: {
      start: apartment.startHoNumber,
      end: apartment.endHoNumber,
    },
  };
}

export default {
  getApartmentsList,
  getApartmentDetail,
};
