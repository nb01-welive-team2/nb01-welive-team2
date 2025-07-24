import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  editEvent,
  getEventList,
  removeEvent,
} from "../controllers/eventController";
import authenticate from "@/middlewares/authenticate";
import { requireRole } from "@/middlewares/requireRole";
import { USER_ROLE } from "@prisma/client";

const eventsRouter = express.Router();
eventsRouter.delete(
  "/:eventId",
  authenticate(),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(removeEvent)
);
eventsRouter.put(
  "/",
  authenticate(),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(editEvent)
);
eventsRouter.get(
  "/",
  authenticate(),
  requireRole([USER_ROLE.ADMIN, USER_ROLE.USER]),
  withAsync(getEventList)
);

export default eventsRouter;
