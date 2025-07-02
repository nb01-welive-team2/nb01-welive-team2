import residentsService from "../../../src/services/residentsService";
import residentsRepository from "../../../src/repositories/residentsRepository";
import { parseResidentsCsv } from "@/lib/utils/parseResidentsCsv";
import {
  APPROVAL_STATUS,
  HOUSEHOLDER_STATUS,
  RESIDENCE_STATUS,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

jest.mock("../../../src/repositories/residentsRepository");
jest.mock("@/lib/utils/parseResidentsCsv");

describe("Residents Service", () => {
  const mockResidents = {
    id: "unitTestUuid12341234",
    apartmentId: "1298as23-2892-463f-b3e7-awe1o2ja2a",
    building: 1009,
    unitNumber: 999,
    contact: "010-1234-7421",
    name: "김찬호",
    email: "qmqmdisn123@example.com",
    residenceStatus: RESIDENCE_STATUS.RESIDENCE,
    isHouseholder: HOUSEHOLDER_STATUS.HOUSEHOLDER,
    isRegistered: true,
    approvalStatus: APPROVAL_STATUS.APPROVED,
  };

  const mockResidentInput = {
    building: 1009,
    unitNumber: 999,
    contact: "010-1234-7421",
    name: "김찬호",
    email: "qmqmdisn123@example.com",
    isHouseholder: HOUSEHOLDER_STATUS.HOUSEHOLDER,
    apartmentId: "1298as23-2892-463f-b3e7-awe1o2ja2a",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadResident", () => {
    test("입주민 등록 성공", async () => {
      jest
        .mocked(residentsRepository.createResident)
        .mockResolvedValue(mockResidents);
      const result = await residentsService.uploadResident(mockResidentInput);

      const { apartmentId, ...restInput } = mockResidentInput;

      expect(residentsRepository.createResident).toHaveBeenCalledWith({
        ...restInput,
        residenceStatus: RESIDENCE_STATUS.RESIDENCE,
        isRegistered: false,
        approvalStatus: APPROVAL_STATUS.PENDING,
        apartmentInfo: {
          connect: {
            id: apartmentId,
          },
        },
      });
      expect(result).toEqual(mockResidents);
    });
  });

  describe("uploadResidentsCsvFile", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest
        .spyOn(prisma, "$transaction")
        .mockImplementation(async (callback) => {
          return await callback({} as any);
        });
    });

    test("CSV 텍스트로 입주민 여러 명 등록 성공", async () => {
      const mockCsvText = "CSV TEXT";
      const mockApartmentId = "apt-id-123";

      const parsedCsvData = [
        {
          name: "디지몬",
          building: 108,
          unitNumber: 1502,
          contact: "010-1111-2222",
          email: "example@test.com",
          isHouseholder: "MEMBER",
        },
      ];

      jest.mocked(parseResidentsCsv).mockReturnValue(parsedCsvData);

      const expectedResident = {
        id: "mocked-id",
        apartmentId: "apt-id-123",
        building: 108,
        unitNumber: 1502,
        contact: "010-1111-2222",
        name: "디지몬",
        email: "example@test.com",
        residenceStatus: RESIDENCE_STATUS.RESIDENCE,
        isHouseholder: HOUSEHOLDER_STATUS.MEMBER,
        isRegistered: false,
        approvalStatus: APPROVAL_STATUS.PENDING,
      };

      jest
        .mocked(residentsRepository.uploadResident)
        .mockResolvedValue(expectedResident);

      const result = await residentsService.uploadResidentsFromCsv(
        mockCsvText,
        mockApartmentId
      );

      expect(parseResidentsCsv).toHaveBeenCalledWith(mockCsvText);
      expect(residentsRepository.uploadResident).toHaveBeenCalledWith(
        expect.anything(), // tx
        expect.objectContaining({
          name: "디지몬",
          building: 108,
          unitNumber: 1502,
          contact: "010-1111-2222",
          email: "example@test.com",
          apartmentId: mockApartmentId,
          isHouseholder: HOUSEHOLDER_STATUS.MEMBER,
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expectedResident);
    });

    test("필수 필드 누락 시 에러 발생", async () => {
      const invalidData = [
        {
          name: "",
          building: 101,
          unitNumber: 202,
          contact: "010-1234-5678",
          email: "test@example.com",
          isHouseholder: "MEMBER",
        },
      ];

      jest.mocked(parseResidentsCsv).mockReturnValue(invalidData);

      await expect(
        residentsService.uploadResidentsFromCsv("csv text", "apt-id-123")
      ).rejects.toThrow("필수 항목 누락");
    });
  });

  describe("getResidentsList", () => {
    test("입주민 리스트 조회", async () => {
      const mockResidentsList = [mockResidents];
      const query = { apartmentId: "mock-apartment-id" };

      jest
        .mocked(residentsRepository.getResidentsFiltered)
        .mockResolvedValue(mockResidentsList);

      const result = await residentsService.getResidentsList(query);

      expect(residentsRepository.getResidentsFiltered).toHaveBeenCalledWith(
        query
      );
      expect(result).toEqual(mockResidentsList);
    });
  });

  describe("getResidentById", () => {
    test("입주민 상세 조회", async () => {
      jest
        .mocked(residentsRepository.getResidentById)
        .mockResolvedValue(mockResidents);

      const result = await residentsService.getResident("unitTestUuid12341234");

      expect(residentsRepository.getResidentById).toHaveBeenCalledWith(
        "unitTestUuid12341234"
      );
      expect(result).toEqual(mockResidents);
    });
  });

  describe("uploadResidentsCsvFile", () => {
    test("csv 입주민 등록 성공", async () => {});
  });

  describe("patchResident", () => {
    test("입주민 정보 수정", async () => {
      const updateData = {
        name: "코드잇",
      };
      const updatedResidentData = {
        ...mockResidents,
        ...updateData,
      };

      jest
        .mocked(residentsRepository.getResidentById)
        .mockResolvedValue(mockResidents);

      jest
        .mocked(residentsRepository.updateResidentInfo)
        .mockResolvedValue(updatedResidentData);

      const result = await residentsService.patchResident(
        "unitTestUuid12341234",
        updateData
      );

      expect(residentsRepository.updateResidentInfo).toHaveBeenCalledWith(
        "unitTestUuid12341234",
        updateData
      );
      expect(result.name).toEqual(updateData.name);
    });
  });

  describe("deleteResident", () => {
    test("입주민 정보 삭제", async () => {
      jest
        .mocked(residentsRepository.getResidentById)
        .mockResolvedValue(mockResidents);
      jest
        .mocked(residentsRepository.deleteResident)
        .mockResolvedValue(mockResidents);

      const result = await residentsService.removeResident(
        "unitTestUuid12341234"
      );

      expect(residentsRepository.deleteResident).toHaveBeenCalledWith(
        "unitTestUuid12341234"
      );
      expect(result).toEqual(mockResidents);
    });
  });
});
