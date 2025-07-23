import optionService from "@/services/optionService";
import optionRepository from "@/repositories/optionRepository";
import NotFoundError from "@/errors/NotFoundError";
import ForbiddenError from "@/errors/ForbiddenError";

jest.mock("@/repositories/optionRepository");

describe("optionService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUserId = "8e9c75f4-fd76-48f5-9f16-0f2f991d1d5c"; // UUID
  const mockApartmentId = "f6c29d11-0d1c-4f1d-8437-92a93888d44b"; // UUID
  const mockOptionId = "3a4c6f9b-3e4b-4d6e-a128-2b3c35b83f59"; // UUID

  describe("createVote", () => {
    it("정상적으로 투표 생성 후 PollOption 반환", async () => {
      const pollData = {
        poll: {
          apartmentId: mockApartmentId,
          pollOptions: [
            { id: mockOptionId, votes: [] },
            { id: "other-option", votes: [] },
          ],
        },
      };

      (optionRepository.findPollByOptionId as jest.Mock)
        .mockResolvedValueOnce(pollData) // 첫 번째 findPollByOptionId
        .mockResolvedValueOnce(pollData); // 마지막 return 시 findPollByOptionId

      (optionRepository.create as jest.Mock).mockResolvedValue({});

      const result = await optionService.createVote(
        mockOptionId,
        mockUserId,
        mockApartmentId
      );

      expect(optionRepository.findPollByOptionId).toHaveBeenCalledWith(
        mockOptionId
      );
      expect(optionRepository.create).toHaveBeenCalledWith({
        user: { connect: { id: mockUserId } },
        option: { connect: { id: mockOptionId } },
      });
      expect(result).toEqual(pollData);
    });

    it("옵션이 존재하지 않으면 NotFoundError 발생", async () => {
      (optionRepository.findPollByOptionId as jest.Mock).mockResolvedValue(
        null
      );

      await expect(
        optionService.createVote(mockOptionId, mockUserId, mockApartmentId)
      ).rejects.toThrow(NotFoundError);

      expect(optionRepository.findPollByOptionId).toHaveBeenCalledWith(
        mockOptionId
      );
    });

    it("아파트 ID가 다르면 ForbiddenError 발생", async () => {
      const pollData = {
        poll: {
          apartmentId: "another-apartment-id",
          pollOptions: [{ id: mockOptionId, votes: [] }],
        },
      };

      (optionRepository.findPollByOptionId as jest.Mock).mockResolvedValue(
        pollData
      );

      await expect(
        optionService.createVote(mockOptionId, mockUserId, mockApartmentId)
      ).rejects.toThrow(ForbiddenError);
    });

    it("이미 다른 옵션에 투표한 경우 ForbiddenError 발생", async () => {
      const pollData = {
        poll: {
          apartmentId: mockApartmentId,
          pollOptions: [
            { id: mockOptionId, votes: [] },
            {
              id: "another-option-id",
              votes: [{ userId: mockUserId }], // 이미 투표한 옵션
            },
          ],
        },
      };

      (optionRepository.findPollByOptionId as jest.Mock).mockResolvedValue(
        pollData
      );

      await expect(
        optionService.createVote(mockOptionId, mockUserId, mockApartmentId)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("removeVote", () => {
    it("정상적으로 투표 삭제 후 PollOption 반환", async () => {
      const pollData = {
        poll: {
          apartmentId: mockApartmentId,
          pollOptions: [{ id: mockOptionId, votes: [] }],
        },
      };

      (optionRepository.deleteById as jest.Mock).mockResolvedValue({});
      (optionRepository.findPollByOptionId as jest.Mock).mockResolvedValue(
        pollData
      );

      const result = await optionService.removeVote(mockOptionId, mockUserId);

      expect(optionRepository.deleteById).toHaveBeenCalledWith(
        mockOptionId,
        mockUserId
      );
      expect(optionRepository.findPollByOptionId).toHaveBeenCalledWith(
        mockOptionId
      );
      expect(result).toEqual(pollData);
    });
  });
});
