import { signupAdmin, signupUser } from "@/controllers/userController";
import { withAsync } from "@/lib/withAsync";
import express from "express";

const userRouter = express.Router();

userRouter.post("/signup", withAsync(signupUser));
userRouter.post("/signup/admin", withAsync(signupAdmin));
// userRouter.post("/signup/super-admin", withAsync(signupSuperAdmin));

export default userRouter;
