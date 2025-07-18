import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  editEvent,
  getEventList,
  removeEvent,
} from "../controllers/eventController";
import authenticate from "@/middlewares/authenticate";

const eventsRouter = express.Router();
eventsRouter.delete("/:eventId", authenticate(), withAsync(removeEvent));
eventsRouter.put("/", authenticate(), withAsync(editEvent));
eventsRouter.get("/", authenticate(), withAsync(getEventList));

export default eventsRouter;
