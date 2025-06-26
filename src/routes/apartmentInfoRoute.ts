import {
  getApartmentDetailController,
  getApartmentsListController,
} from "@/controllers/apartmentController";
import { Router } from "express";
import { withAsync } from "@/lib/withAsync";
import authenticate from "@/middlewares/authenticate";

const apartmentsRouter = Router();

apartmentsRouter.get(
  "/",
  authenticate({ optional: false }),
  withAsync(getApartmentsListController)
);

apartmentsRouter.get(
  "/:id",
  authenticate({ optional: false }),
  withAsync(getApartmentDetailController)
);

export default apartmentsRouter;
