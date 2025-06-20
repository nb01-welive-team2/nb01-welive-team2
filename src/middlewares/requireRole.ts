import UnauthError from "@/errors/UnauthError";
import { AuthenticatedRequest } from "@/types/express";
import { USER_ROLE } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export function requireRolle(allowedRoles: USER_ROLE) {
  return (req: Request, res: Response, next: NextFunction) => {
    const request = req as AuthenticatedRequest;
    const userRole = request.user?.role;

    if (!userRole) {
      return next(new UnauthError());
    }

    if (!allowedRoles.includes(userRole)) {
      return next(new UnauthError());
    }

    next();
  };
}

/**
 * 라우터에서 미들웨어로 사용
 * requireRole(USER_ROLE.역할)
 * [ex]
 * 관리자 승인 API
 * router.post("/admin/approve", authenticateToken, requireRole(USER_ROLE.SUPER_ADMIN), approveAdmin);
 * 입주민 승인 API
 * router.post("/resident/approve", authenticateToken, requireRole(USER_ROLE.ADMIN), approveResident);
 * 입주민 문의 등록 API
 * router.post("/inquiry", authenticateToken, requireRole(USER_ROLE.RESIDENT), createInquiry);
 **/
