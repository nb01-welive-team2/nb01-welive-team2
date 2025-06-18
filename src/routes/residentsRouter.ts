import { Router } from "express";
import {
  getResidentsListFilteredController,
  getResidentByIdController,
  updateResidentInfoController,
  deleteResidentController,
  uploadResidentController,
} from "../controllers/residentsContoller";
import { withAsync } from "../lib/withAsync";

const residentsRouter = Router();

residentsRouter.post("/register", withAsync(uploadResidentController));
residentsRouter.get("/:id", withAsync(getResidentByIdController));
residentsRouter.patch("/:id", withAsync(updateResidentInfoController));
residentsRouter.delete("/:id", withAsync(deleteResidentController));
residentsRouter.get("/", withAsync(getResidentsListFilteredController));

export default residentsRouter;
