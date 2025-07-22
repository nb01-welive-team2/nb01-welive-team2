import { Request, Response } from "express";
import ForbiddenError from "../errors/ForbiddenError";
import { create, validate } from "superstruct";
import { USER_ROLE } from "@prisma/client";
import { AuthenticatedRequest } from "@/types/express";
import registerSuccessMessage from "@/lib/responseJson/registerSuccess";
import { VoteBodyStruct } from "@/structs/optionStructs";
import optionService from "@/services/optionService";
import removeSuccessMessage from "@/lib/responseJson/removeSuccess";
import { ResponseOptionDTO, ResponseWinnerOptionDTO } from "@/dto/optionDTO";

export async function createOption(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const { optionId } = create(req.body, VoteBodyStruct);

  if (reqWithPayload.user.role === USER_ROLE.SUPER_ADMIN) {
    throw new ForbiddenError();
  }
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
  if (reqWithPayload.user.role === USER_ROLE.SUPER_ADMIN) {
    throw new ForbiddenError();
  }
  const { optionId } = create(req.params, VoteBodyStruct);
  const option = await optionService.removeVote(
    optionId,
    reqWithPayload.user.userId
  );
  res
    .status(200)
    .send(new ResponseOptionDTO(option!, "Vote removed successfully"));
}
