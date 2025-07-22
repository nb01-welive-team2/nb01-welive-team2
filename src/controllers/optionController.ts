import { Request, Response } from "express";
import * as optionService from "../services/optionService";
import UnauthError from "../errors/UnauthError";
import ForbiddenError from "../errors/ForbiddenError";
import {
  createOptionSchema,
  optionIdParamSchema,
} from "../structs/optionStructs";
import { validate } from "superstruct";
import { USER_ROLE } from "@prisma/client";
import { AuthenticatedRequest } from "@/types/express";
import registerSuccessMessage from "@/lib/responseJson/registerSuccess";

export async function createOption(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  const data = create(req.body, CreateOptionBodyStruct);

  if (reqWithPayload.user.role !== USER_ROLE.ADMIN) {
    throw new ForbiddenError();
  }

  const isEvent = Boolean(data.startDate && data.endDate);

  await optionService.createOption(
    data,
    reqWithPayload.user.userId,
    reqWithPayload.user.apartmentId,
    isEvent
  );

  res.status(201).send(new registerSuccessMessage());
}

export async function removeOption(req: Request, res: Response) {
  const reqWithPayload = req as AuthenticatedRequest;
  if (reqWithPayload.user.role !== USER_ROLE.ADMIN) {
    throw new ForbiddenError();
  }
  const { optionId } = create(req.params, OptionIdParamStruct);
  await optionService.removeOption(optionId);
  res.status(200).send(new removeSuccessMessage());
}
