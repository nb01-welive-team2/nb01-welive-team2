import { Router } from "express";
import {
  getResidentsListFilteredController,
  getResidentByIdController,
  updateResidentInfoController,
  deleteResidentController,
  uploadResidentController,
} from "../controllers/residentsContoller";

const residentsRouter = Router();

residentsRouter.get("/", getResidentsListFilteredController);
residentsRouter.get("/:id", getResidentByIdController);
residentsRouter.patch("/:id", updateResidentInfoController);
residentsRouter.delete("/:id", deleteResidentController);
residentsRouter.post("/register", uploadResidentController);

export default residentsRouter;
