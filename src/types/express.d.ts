import Express, { Request } from "express";
import { USER_ROLE } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: USER_ROLE;
        apartmentId: string;
      };
    }
  }
}

export type AuthenticatedRequest<T extends Request = Request> = T & {
  user: {
    userId: string;
    role: USER_ROLE;
    apartmentId: string;
  };
};
