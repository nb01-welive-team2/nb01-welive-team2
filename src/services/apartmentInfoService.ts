import apartmentInfoRepository from "@/repositories/apartmentInfoRepository";
import residentsRepository from "@/repositories/residentsRepository";

async function getApartmentsList(
  query: {
    apartmentName?: string;
    apartmentAddress?: string;
  },
  isAuthenticated: boolean
) {
  const apartments = await apartmentInfoRepository.findApartmentsList(query);
  return {
    apartments: apartments.map((apt) =>
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
    ),
  };
}

export default {
  getApartmentsList,
};
