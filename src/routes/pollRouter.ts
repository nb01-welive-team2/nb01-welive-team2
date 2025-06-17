import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  getPoll,
  editPoll,
  removePoll,
  createPoll,
  getPollList,
} from "../controllers/pollController";

const pollsRouter = express.Router();
pollsRouter.get("/:pollId", withAsync(getPoll));
pollsRouter.put("/:pollId", withAsync(editPoll));
pollsRouter.delete("/:pollId", withAsync(removePoll));
pollsRouter.post("/", withAsync(createPoll));
pollsRouter.get("/", withAsync(getPollList));

export default pollsRouter;
