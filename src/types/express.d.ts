import Express from "express";
import { USER_ROLE } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        id: string;
        role: USER_ROLE;
      };
    }
  }
}
