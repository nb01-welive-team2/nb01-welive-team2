import express from "express";
import { login, logout } from "../controllers/authController";
import { withAsync } from "../lib/withAsync";

const authRouter = express.Router();
authRouter.post("/login", withAsync(login));
authRouter.post("/logout", withAsync(logout));

export default authRouter;
