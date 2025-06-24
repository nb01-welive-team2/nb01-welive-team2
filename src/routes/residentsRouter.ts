import { Router } from "express";
import {
  getResidentsListFilteredController,
  getResidentByIdController,
  updateResidentInfoController,
  deleteResidentController,
  uploadResidentController,
  uploadResidentsCsvController,
  downloadResidentsCsvController,
  downloadResidentsCsvTemplateController,
} from "../controllers/residentsContoller";
import authenticate from "@/middlewares/authenticate";
import upload from "@/middlewares/multer";
import { withAsync } from "../lib/withAsync";

const residentsRouter = Router();

residentsRouter.get(
  "/template",
  authenticate({ optional: false }),
  withAsync(downloadResidentsCsvTemplateController)
);

residentsRouter.get(
  "/download",
  authenticate({ optional: false }),
  withAsync(downloadResidentsCsvController)
);

residentsRouter.post(
  "/upload",
  authenticate({ optional: false }),
  upload.single("file"),
  withAsync(uploadResidentsCsvController)
);

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
