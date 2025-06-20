import express from "express";
import { login, logout, refreshToken } from "../controllers/authController";
import { withAsync } from "../lib/withAsync";
import authenticate from "../middlewares/authenticate";
import {
  signupAdmin,
  signupSuperAdmin,
  signupUser,
  updateAdmin,
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
  requireRolle(USER_ROLE.SUPER_ADMIN),
  withAsync(updateAdmin)
);

export default authRouter;
