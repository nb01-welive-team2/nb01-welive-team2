import express from "express";
import { login, logout, refreshToken } from "../controllers/authController";
import { withAsync } from "../lib/withAsync";
import authenticate from "../middlewares/authenticate";
import {
  approveAdmin,
  approveAllAdmins,
  approveAllUsers,
  approveUser,
  deleteAdmin,
  deleteRejectedUsers,
  rejectAdmin,
  rejectAllAdmins,
  rejectAllUsers,
  rejectUser,
  signupAdmin,
  signupSuperAdmin,
  signupUser,
  updateAdminController,
} from "@/controllers/userController";
import { USER_ROLE } from "@prisma/client";
import { requireRolle } from "@/middlewares/requireRole";

const authRouter = express.Router();

authRouter.post("/login", withAsync(login));
authRouter.post("/logout", withAsync(logout));
authRouter.post(
  "/refresh",
  authenticate({ optional: true }),
  withAsync(refreshToken)
);
authRouter.post("/signup", withAsync(signupUser));
authRouter.post("/signup/admin", withAsync(signupAdmin));
authRouter.post("/signup/super-admin", withAsync(signupSuperAdmin));
authRouter.patch(
  "/update-admin",
  authenticate({ optional: false }),
  requireRolle([USER_ROLE.SUPER_ADMIN]),
  withAsync(updateAdminController)
);
authRouter.delete(
  "/deleted-admin/:id",
  authenticate({ optional: false }),
  requireRolle([USER_ROLE.SUPER_ADMIN]),
  withAsync(deleteAdmin)
);

authRouter.post(
  "/cleanup",
  authenticate({ optional: false }),
  requireRolle([USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN]),
  withAsync(deleteRejectedUsers)
);

authRouter.post(
  "/approve-amdin",
  authenticate({ optional: false }),
  requireRolle([USER_ROLE.SUPER_ADMIN]),
  withAsync(approveAdmin)
);

authRouter.post(
  "/reject-amdin",
  authenticate({ optional: false }),
  requireRolle([USER_ROLE.SUPER_ADMIN]),
  withAsync(rejectAdmin)
);

authRouter.post(
  "/approve-amdins",
  authenticate({ optional: false }),
  requireRolle([USER_ROLE.SUPER_ADMIN]),
  withAsync(approveAllAdmins)
);

authRouter.post(
  "/reject-amdins",
  authenticate({ optional: false }),
  requireRolle([USER_ROLE.SUPER_ADMIN]),
  withAsync(rejectAllAdmins)
);

authRouter.post(
  "/approve-users",
  authenticate({ optional: false }),
  requireRolle([USER_ROLE.ADMIN]),
  withAsync(approveAllUsers)
);

authRouter.post(
  "/reject-users",
  authenticate({ optional: false }),
  requireRolle([USER_ROLE.ADMIN]),
  withAsync(rejectAllUsers)
);

authRouter.post(
  "/approve-user/:id",
  authenticate({ optional: false }),
  requireRolle([USER_ROLE.ADMIN]),
  withAsync(approveUser)
);

authRouter.post(
  "/reject-user/:id",
  authenticate({ optional: false }),
  requireRolle([USER_ROLE.ADMIN]),
  withAsync(rejectUser)
);

export default authRouter;
