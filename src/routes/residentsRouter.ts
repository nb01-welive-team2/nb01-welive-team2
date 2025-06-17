import { Router } from "express";
import {
  getResidentsListFilteredController,
  getResidentByIdController,
  updateResidentInfoController,
  deleteResidentController,
} from "../controllers/residentsContoller";

const residentsRouter = Router();

residentsRouter.get("/", getResidentsListFilteredController);
residentsRouter.get("/:id", getResidentByIdController);
residentsRouter.patch("/:id", updateResidentInfoController);
residentsRouter.delete("/:id", deleteResidentController);

export default residentsRouter;
