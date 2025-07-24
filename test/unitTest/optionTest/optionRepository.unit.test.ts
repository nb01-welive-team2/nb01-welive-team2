import optionRepository from "@/repositories/optionRepository";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    votes: {
      create: jest.fn(),
      delete: jest.fn(),
    },
    pollOptions: {
      findUnique: jest.fn(),
    },
  },
}));

describe("optionRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockOptionId = "3a4c6f9b-3e4b-4d6e-a128-2b3c35b83f59"; // UUID
  const mockUserId = "8e9c75f4-fd76-48f5-9f16-0f2f991d1d5c"; // UUID

  describe("create", () => {
    it("투표 생성 시 prisma.votes.create 호출", async () => {
      const mockVote = {
        option: { connect: { id: mockOptionId } },
        user: { connect: { id: mockUserId } },
      };

      (prisma.votes.create as jest.Mock).mockResolvedValue(mockVote);

      const result = await optionRepository.create(mockVote);

      expect(prisma.votes.create).toHaveBeenCalledWith({ data: mockVote });
      expect(result).toEqual(mockVote);
    });
  });

  describe("findPollByOptionId", () => {
    it("optionId로 pollOptions 조회", async () => {
      const mockPollOption = {
        id: mockOptionId,
        poll: {
          pollOptions: [
            {
              id: mockOptionId,
              votes: [],
              _count: { votes: 0 },
            },
          ],
          apartmentId: "f6c29d11-0d1c-4f1d-8437-92a93888d44b",
        },
      };

      (prisma.pollOptions.findUnique as jest.Mock).mockResolvedValue(
        mockPollOption
      );

      const result = await optionRepository.findPollByOptionId(mockOptionId);

      expect(prisma.pollOptions.findUnique).toHaveBeenCalledWith({
        where: { id: mockOptionId },
        include: {
          poll: {
            include: {
              pollOptions: {
                include: {
                  votes: true,
                  _count: {
                    select: { votes: true },
                  },
                },
              },
            },
          },
        },
      });

      expect(result).toEqual(mockPollOption);
    });
  });

  describe("deleteById", () => {
    it("optionId와 userId로 투표 삭제", async () => {
      const mockDeleteResult = { optionId: mockOptionId, userId: mockUserId };

      (prisma.votes.delete as jest.Mock).mockResolvedValue(mockDeleteResult);

      const result = await optionRepository.deleteById(
        mockOptionId,
        mockUserId
      );

      expect(prisma.votes.delete).toHaveBeenCalledWith({
        where: {
          optionId_userId: {
            optionId: mockOptionId,
            userId: mockUserId,
          },
        },
      });

      expect(result).toEqual(mockDeleteResult);
    });
  });
});
