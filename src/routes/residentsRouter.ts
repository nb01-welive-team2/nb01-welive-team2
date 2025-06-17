import { Router } from "express";
import {
  getResidentsListFilteredController,
  getResidentByIdController,
} from "../controllers/residentsContoller";

const residentsRouter = Router();

residentsRouter.get("/", getResidentsListFilteredController);
residentsRouter.get("/:id", getResidentByIdController);

export default residentsRouter;
