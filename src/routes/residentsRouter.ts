import { Router } from "express";
import {
  getResidentsListFilteredController,
  getResidentByIdController,
  updateResidentInfoController,
  deleteResidentController,
  uploadResidentController,
} from "../controllers/residentsContoller";
import authenticate from "@/middlewares/authenticate";
import { withAsync } from "../lib/withAsync";

const residentsRouter = Router();

residentsRouter.post(
  "/register",
  authenticate({ optional: false }),
  withAsync(uploadResidentController)
);
residentsRouter.get(
  "/:id",
  authenticate({ optional: false }),
  withAsync(getResidentByIdController)
);
residentsRouter.patch(
  "/:id",
  authenticate({ optional: false }),
  withAsync(updateResidentInfoController)
);
residentsRouter.delete(
  "/:id",
  authenticate({ optional: false }),
  withAsync(deleteResidentController)
);
residentsRouter.get(
  "/",
  authenticate({ optional: false }),
  withAsync(getResidentsListFilteredController)
);

export default residentsRouter;
