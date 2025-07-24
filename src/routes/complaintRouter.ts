import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  changeStatus,
  createComplaint,
  editComplaint,
  getComplaint,
  getComplaintList,
  removeComplaint,
} from "../controllers/complaintController";
import authenticate from "@/middlewares/authenticate";
import { requireRole } from "@/middlewares/requireRole";
import { USER_ROLE } from "@prisma/client";

const complaintsRouter = express.Router();
complaintsRouter.patch(
  "/:complaintId/status",
  authenticate(),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(changeStatus)
);
complaintsRouter.get(
  "/:complaintId",
  authenticate(),
  requireRole([USER_ROLE.ADMIN, USER_ROLE.USER]),
  withAsync(getComplaint)
);
complaintsRouter.put(
  "/:complaintId",
  authenticate(),
  requireRole([USER_ROLE.USER]),
  withAsync(editComplaint)
);
complaintsRouter.delete(
  "/:complaintId",
  authenticate(),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(removeComplaint)
);
complaintsRouter.post(
  "/",
  authenticate(),
  requireRole([USER_ROLE.USER]),
  withAsync(createComplaint)
);
complaintsRouter.get(
  "/",
  authenticate(),
  requireRole([USER_ROLE.ADMIN, USER_ROLE.USER]),
  withAsync(getComplaintList)
);

export default complaintsRouter;
