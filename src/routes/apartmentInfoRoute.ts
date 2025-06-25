import { getApartmentsListController } from "@/controllers/apartmentController";
import { Router } from "express";
import { withAsync } from "@/lib/withAsync";
import authenticate from "@/middlewares/authenticate";

const apartmentsRouter = Router();

apartmentsRouter.get(
  "/",
  authenticate({ optional: true }),
  withAsync(getApartmentsListController)
);

export default apartmentsRouter;
