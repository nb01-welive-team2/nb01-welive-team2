import express from "express";
import { withAsync } from "../lib/withAsync";
import authenticate from "@/middlewares/authenticate";
import {
  getNotificationsHandler,
  patchNotificationHandler,
  getNotificationByIdHandler,
  createNotificationHandler,
} from "../controllers/notificationController";

const notificationsRouter = express.Router();

notificationsRouter.get(
  "/notifications",
  authenticate(),
  withAsync(getNotificationsHandler)
);
notificationsRouter.patch(
  "/notifications/:id",
  withAsync(patchNotificationHandler)
);

notificationsRouter.get(
  "/notifications/:id",
  withAsync(getNotificationByIdHandler)
);

notificationsRouter.post(
  "/notifications",
  withAsync(createNotificationHandler)
);

export default notificationsRouter;
