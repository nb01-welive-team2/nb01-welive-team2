import express from "express";
import { withAsync } from "../lib/withAsync";
import authenticate from "@/middlewares/authenticate";
import { getNotificationsHandler } from "../controllers/notificationController";

const notificationsRouter = express.Router();

notificationsRouter.get(
  "/notifications",
  authenticate(),
  withAsync(getNotificationsHandler)
);
export default notificationsRouter;
