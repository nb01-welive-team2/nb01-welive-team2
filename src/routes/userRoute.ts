import { signupUser } from "@/controllers/userController";
import { withAsync } from "@/lib/withAsync";
import express from "express";

const userRouter = express.Router();

userRouter.post("/signup", withAsync(signupUser));

export default userRouter;
