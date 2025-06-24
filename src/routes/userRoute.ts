import { updatePassword } from "@/controllers/authController";
import { withAsync } from "@/lib/withAsync";
import authenticate from "@/middlewares/authenticate";
import express from "express";

const userRouter = express.Router();

userRouter.patch(
  "/password",
  authenticate({ optional: false }),
  withAsync(updatePassword)
);

export default userRouter;
