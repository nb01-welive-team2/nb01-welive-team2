import apartmentInfoService from "@/services/apartmentInfoService";
import apartmentInfoRepository from "@/repositories/apartmentInfoRepository";
import { APPROVAL_STATUS } from "@prisma/client";

jest.mock("../../../src/repositories/apartmentInfoRepository");

describe("apartmentInfoService", () => {
  const mockApartments = [
    {
      id: "apt-uuid-1",
      userId: "user-uuid-1",
      approvalStatus: APPROVAL_STATUS.APPROVED,
      apartmentName: "Sunshine Apartments",
      apartmentAddress: "123 Sunshine St.",
      apartmentManagementNumber: "MNG-001",
      description: "A beautiful apartment complex.",
      startComplexNumber: 1,
      endComplexNumber: 3,
      startDongNumber: 101,
      endDongNumber: 110,
      startFloorNumber: 1,
      endFloorNumber: 15,
      startHoNumber: 101,
      endHoNumber: 150,
      createdAt: new Date("2023-01-01T00:00:00Z"),
    },
    {
      id: "apt-uuid-2",
      userId: "user-uuid-2",
      approvalStatus: APPROVAL_STATUS.PENDING,
      apartmentName: "Moonlight Residences",
      apartmentAddress: "456 Moonlight Ave.",
      apartmentManagementNumber: "MNG-002",
      description: "Modern living at its best.",
      startComplexNumber: 4,
      endComplexNumber: 5,
      startDongNumber: 201,
      endDongNumber: 210,
      startFloorNumber: 1,
      endFloorNumber: 20,
      startHoNumber: 201,
      endHoNumber: 250,
      createdAt: new Date("2023-06-01T00:00:00Z"),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getApartmentsList", () => {
    test("미가입자 아파트 목록 조회 반환", async () => {
      jest
        .mocked(apartmentInfoRepository.findApartmentsList)
        .mockResolvedValue(mockApartments);

      const result = await apartmentInfoService.getApartmentsList({}, false);

      expect(apartmentInfoRepository.findApartmentsList).toHaveBeenCalledWith(
        {}
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: mockApartments[0].id,
        name: mockApartments[0].apartmentName,
        address: mockApartments[0].apartmentAddress,
      });

      expect(result[1]).toMatchObject({
        id: mockApartments[1].id,
        name: mockApartments[1].apartmentName,
        address: mockApartments[1].apartmentAddress,
      });
    });

    test("가입자 아파트 목록 조회 반환", async () => {
      jest
        .mocked(apartmentInfoRepository.findApartmentsList)
        .mockResolvedValue(mockApartments);

      const result = await apartmentInfoService.getApartmentsList({}, true);

      expect(apartmentInfoRepository.findApartmentsList).toHaveBeenCalledWith(
        {}
      );
      expect(result[0]).toMatchObject({
        id: mockApartments[0].id,
        name: mockApartments[0].apartmentName,
        address: mockApartments[0].apartmentAddress,
        dongRange: {
          start: mockApartments[0].startDongNumber,
          end: mockApartments[0].endDongNumber,
        },
        hoRange: {
          start: mockApartments[0].startHoNumber,
          end: mockApartments[0].endHoNumber,
        },
      });
    });
  });

  describe("getApartment", () => {
    test("아파트 상세 조회 (회원가입시 사용)", async () => {
      jest
        .mocked(apartmentInfoRepository.findById)
        .mockResolvedValue(mockApartments[0]);

      const result = await apartmentInfoService.getApartmentDetail(
        mockApartments[0].id
      );

      expect(apartmentInfoRepository.findById).toHaveBeenCalledWith(
        mockApartments[0].id
      );
      expect(result).toMatchObject({
        id: mockApartments[0].id,
        name: mockApartments[0].apartmentName,
        address: mockApartments[0].apartmentAddress,
        dongRange: {
          start: mockApartments[0].startDongNumber,
          end: mockApartments[0].endDongNumber,
        },
        hoRange: {
          start: mockApartments[0].startHoNumber,
          end: mockApartments[0].endHoNumber,
        },
      });
    });
  });
});
