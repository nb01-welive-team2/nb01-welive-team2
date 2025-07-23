import { Request, Response } from "express";
import { create } from "superstruct";
import { AuthenticatedRequest } from "@/types/express";
import { VoteBodyStruct } from "@/structs/optionStructs";
import optionService from "@/services/optionService";
import { ResponseOptionDTO, ResponseWinnerOptionDTO } from "@/dto/optionDTO";

export async function voteOption(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const { optionId } = create(req.params, VoteBodyStruct);
  const option = await optionService.createVote(
    optionId,
    reqWithPayload.user.userId,
    reqWithPayload.user.apartmentId
  );

  res
    .status(201)
    .send(new ResponseWinnerOptionDTO(option!, "Vote created successfully"));
}

export async function removeOption(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const { optionId } = create(req.params, VoteBodyStruct);
  const option = await optionService.removeVote(
    optionId,
    reqWithPayload.user.userId
  );
  res
    .status(200)
    .send(new ResponseOptionDTO(option!, "Vote removed successfully"));
}
