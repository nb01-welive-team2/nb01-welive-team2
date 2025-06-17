import { Router } from "express";
import { getResidentsListFiltered } from "../controllers/residentsContoller";

const residentsRouter = Router();

residentsRouter.get("/", getResidentsListFiltered);

export default residentsRouter;
