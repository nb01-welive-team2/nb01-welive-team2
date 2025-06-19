import express from "express";
import { login, logout, refreshToken } from "../controllers/authController";
import { withAsync } from "../lib/withAsync";
import authenticate from "../middlewares/authenticate";

const authRouter = express.Router();
authRouter.post("/login", withAsync(login));
authRouter.post("/logout", withAsync(logout));
authRouter.post(
  "/refresh",
  authenticate({ optional: true }),
  withAsync(refreshToken)
);

export default authRouter;
