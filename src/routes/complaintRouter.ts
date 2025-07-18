import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  createComplaint,
  editComplaint,
  getComplaint,
  getComplaintList,
  removeComplaint,
} from "../controllers/complaintController";
import { authenticate } from "@/middlewares/authenticate";

const complaintsRouter = express.Router();
complaintsRouter.get("/:complaintId", authenticate(), withAsync(getComplaint));
complaintsRouter.put("/:complaintId", authenticate(), withAsync(editComplaint));
complaintsRouter.delete(
  "/:complaintId",
  authenticate(),
  withAsync(removeComplaint)
);
complaintsRouter.post("/", authenticate(), withAsync(createComplaint));
complaintsRouter.get("/", authenticate(), withAsync(getComplaintList));

export default complaintsRouter;
