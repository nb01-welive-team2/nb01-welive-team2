import { Router } from "express";
import {
  getResidentsListFilteredController,
  getResidentByIdController,
  updateResidentInfoController,
  deleteResidentController,
  uploadResidentController,
} from "../controllers/residentsContoller";

const residentsRouter = Router();

residentsRouter.post("/register", uploadResidentController);
residentsRouter.get("/:id", getResidentByIdController);
residentsRouter.patch("/:id", updateResidentInfoController);
residentsRouter.delete("/:id", deleteResidentController);
residentsRouter.get("/", getResidentsListFilteredController);

export default residentsRouter;
