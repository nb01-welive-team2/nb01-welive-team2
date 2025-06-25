import apartmentInfoRepository from "@/repositories/apartmentInfoRepository";

async function getApartmentsList(
  query: {
    apartmentName?: string;
    apartmentAddress?: string;
  },
  isAuthenticated: boolean
) {
  return isAuthenticated
    ? apartmentInfoRepository.findApartmentsList(query)
    : apartmentInfoRepository.findPublicApartmentsList(query);
}

export default {
  getApartmentsList,
};
