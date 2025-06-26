import { USER_ROLE } from "@prisma/client";
import Express, { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: USER_ROLE;
        apartmentId: string;
      };
    }
  }
}

export type AuthenticatedRequest<T extends Request = Request> = T & {
  user: { userId: string; role: USER_ROLE; apartmentId: string };
};
