import express from "express";
import { withAsync } from "../lib/withAsync";
import authenticate from "@/middlewares/authenticate";

const optionsRouter = express.Router();
optionsRouter.post("/:optionId/vote", authenticate(), withAsync(voteOption));
optionsRouter.delete(
  "/:optionId/vote",
  authenticate(),
  withAsync(removeOption)
);

export default optionsRouter;
