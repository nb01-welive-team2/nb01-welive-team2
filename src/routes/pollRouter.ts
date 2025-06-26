import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  getPoll,
  editPoll,
  removePoll,
  createPoll,
  getPollList,
} from "../controllers/pollController";
import authenticate from "@/middlewares/authenticate";

const pollsRouter = express.Router();
pollsRouter.get("/:pollId", authenticate(), withAsync(getPoll));
pollsRouter.put("/:pollId", authenticate(), withAsync(editPoll));
pollsRouter.delete("/:pollId", authenticate(), withAsync(removePoll));
pollsRouter.post("/", authenticate(), withAsync(createPoll));
pollsRouter.get("/", authenticate(), withAsync(getPollList));

export default pollsRouter;
