import {
  getApartmentDetailController,
  getApartmentsListController,
} from "@/controllers/apartmentController";
import { Router } from "express";
import { withAsync } from "@/lib/withAsync";
import authenticate from "@/middlewares/authenticate";
import { optionalAuth } from "@/middlewares/authenticate";

const apartmentsRouter = Router();

apartmentsRouter.get(
  "/",
  optionalAuth(),
  withAsync(getApartmentsListController)
);

apartmentsRouter.get(
  "/:id",
  authenticate({ optional: false }),
  withAsync(getApartmentDetailController)
);

export default apartmentsRouter;
