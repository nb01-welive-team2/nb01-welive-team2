import { prisma } from "../../src/lib/prisma";
import residentsService from "../../src/services/residentsService";
import residentsRepository from "../../src/repositories/residentsRepository";
import {
  APPROVAL_STATUS,
  HOUSEHOLDER_STATUS,
  RESIDENCE_STATUS,
} from "@prisma/client";

jest.mock("../../src/repositories/residentsRepository");

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

  describe("getResidentsList", () => {
    test("입주민 리스트 조회", async () => {
      const mockResidentsList = [mockResidents];
      const query = {};

      jest
        .mocked(residentsRepository.getResidentsFiltered)
        .mockResolvedValue(mockResidentsList);

      const result = await residentsService.getResidentsList(query);

      expect(residentsRepository.getResidentsFiltered).toHaveBeenCalledWith({});
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
