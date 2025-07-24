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
import { requireRole } from "@/middlewares/requireRole";
import { USER_ROLE } from "@prisma/client";

const residentsRouter = Router();

residentsRouter.get(
  "/template",
  authenticate({ optional: false }),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(downloadResidentsCsvTemplateController)
);

residentsRouter.get(
  "/download",
  authenticate({ optional: false }),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(downloadResidentsCsvController)
);

residentsRouter.post(
  "/upload",
  authenticate({ optional: false }),
  requireRole([USER_ROLE.ADMIN]),
  upload.single("file"),
  withAsync(uploadResidentsCsvController)
);

residentsRouter.post(
  "/register",
  authenticate({ optional: false }),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(uploadResidentController)
);

residentsRouter.get(
  "/:id",
  authenticate({ optional: false }),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(getResidentByIdController)
);

residentsRouter.patch(
  "/:id",
  authenticate({ optional: false }),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(updateResidentInfoController)
);

residentsRouter.delete(
  "/:id",
  authenticate({ optional: false }),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(deleteResidentController)
);

residentsRouter.get(
  "/",
  authenticate({ optional: false }),
  requireRole([USER_ROLE.ADMIN]),
  withAsync(getResidentsListFilteredController)
);

export default residentsRouter;
