import { updatePassword } from "@/controllers/authController";
import { updateUser } from "@/controllers/userController";
import { withAsync } from "@/lib/withAsync";
import authenticate from "@/middlewares/authenticate";
import express from "express";

const userRouter = express.Router();

userRouter.patch(
  "/password",
  authenticate({ optional: false }),
  withAsync(updatePassword)
);
userRouter.patch(
  "/me",
  authenticate({ optional: false }),
  withAsync(updateUser)
);

export default userRouter;
