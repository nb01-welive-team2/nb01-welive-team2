import express from "express";
import { withAsync } from "../lib/withAsync";
import {
  createComplaint,
  editComplaint,
  getComplaint,
  getComplaintList,
  removeComplaint,
} from "../controllers/complaintController";

const complaintsRouter = express.Router();
complaintsRouter.get("/:complaintId", withAsync(getComplaint));
complaintsRouter.put("/:complaintId", withAsync(editComplaint));
complaintsRouter.delete("/:complaintId", withAsync(removeComplaint));
complaintsRouter.post("/", withAsync(createComplaint));
complaintsRouter.get("/", withAsync(getComplaintList));

export default complaintsRouter;
