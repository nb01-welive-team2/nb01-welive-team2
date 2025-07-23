import { voteOption, removeOption } from "@/controllers/optionController";
import optionService from "@/services/optionService";
import { ResponseOptionDTO, ResponseWinnerOptionDTO } from "@/dto/optionDTO";

jest.mock("@/services/optionService");

describe("Option Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    userId: "b3bfb64a-1b34-4c1e-90dc-8f4d0d61b1e3", // UUID
    apartmentId: "c8a5cb77-63e9-4a61-a6de-b57e7c03d6ab", // UUID
  };

  describe("voteOption", () => {
    it("투표 생성 성공 시 201 반환", async () => {
      const optionId = "9a7e8f23-1a4b-4e6f-91c3-33a8ff1d4c6e"; // UUID
      const mockOption = {
        id: optionId,
        content: "Option 1",
        pollId: "c4b4a3ff-3b6c-4d8f-8f07-ef04a9a8b66e", // UUID
        votes: [],
        poll: {
          pollOptions: [
            { id: optionId, votes: [] }, // 자기 자신 포함
            // 필요하면 다른 옵션도 추가 가능
          ],
        },
      };

      (optionService.createVote as jest.Mock).mockResolvedValue(mockOption);

      const req: any = {
        params: { optionId },
        user: mockUser,
      };

      const res: any = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await voteOption(req, res);

      expect(optionService.createVote).toHaveBeenCalledWith(
        optionId,
        mockUser.userId,
        mockUser.apartmentId
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(
        expect.any(ResponseWinnerOptionDTO)
      );

      const responseDto = res.send.mock.calls[0][0];
      expect(responseDto).toEqual(
        expect.objectContaining({
          message: "Vote created successfully",
          option: expect.objectContaining({
            id: optionId,
            content: "Option 1",
          }),
        })
      );
    });
  });

  describe("removeOption", () => {
    it("투표 삭제 성공 시 200 반환", async () => {
      const optionId = "a3d5b25e-6cfa-43d2-9f6e-273a15265f07"; // UUID
      const mockOption = {
        id: optionId,
        content: "Option 2",
        pollId: "e67f23a1-bc39-4e38-8d8e-2437b153c098", // UUID
        votes: [],
        poll: {
          pollOptions: [
            { id: optionId, votes: [] }, // 자기 자신 포함
            // 필요 시 다른 옵션 추가 가능
          ],
        },
      };

      (optionService.removeVote as jest.Mock).mockResolvedValue(mockOption);

      const req: any = {
        params: { optionId },
        user: mockUser,
      };

      const res: any = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await removeOption(req, res);

      expect(optionService.removeVote).toHaveBeenCalledWith(
        optionId,
        mockUser.userId
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.any(ResponseOptionDTO));

      const responseDto = res.send.mock.calls[0][0];
      expect(responseDto).toEqual(
        expect.objectContaining({
          message: "Vote removed successfully",
          option: expect.objectContaining({
            id: optionId,
            content: "Option 2",
          }),
        })
      );
    });
  });
});
