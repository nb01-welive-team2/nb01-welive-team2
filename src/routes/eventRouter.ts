import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  editEvent,
  getEventList,
  removeEvent,
} from "../controllers/eventController";

const eventRouter = express.Router();
eventRouter.delete("/:eventId", withAsync(removeEvent));
eventRouter.put("/", withAsync(editEvent));
eventRouter.get("/", withAsync(getEventList));

export default eventRouter;
