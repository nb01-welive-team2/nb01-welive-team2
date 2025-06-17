import express from "express";
import { login } from "../controllers/authController";
import { withAsync } from "../lib/withAsync";

const authRouter = express.Router();
authRouter.post("/login", withAsync(login));

export default authRouter;
