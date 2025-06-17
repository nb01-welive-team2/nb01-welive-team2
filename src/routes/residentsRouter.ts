import { Router } from "express";
import {
  getResidentsListFilteredController,
  getResidentByIdController,
  updateResidentInfoController,
} from "../controllers/residentsContoller";

const residentsRouter = Router();

residentsRouter.get("/", getResidentsListFilteredController);
residentsRouter.get("/:id", getResidentByIdController);
residentsRouter.patch("/:id", updateResidentInfoController);

export default residentsRouter;
