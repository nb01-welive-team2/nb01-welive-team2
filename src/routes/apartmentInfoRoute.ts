import { getApartmentsListController } from "@/controllers/apartmentController";
import { Router } from "express";
import { withAsync } from "@/lib/withAsync";

const apartmentsRouter = Router();

apartmentsRouter.get("/", withAsync(getApartmentsListController));

export default apartmentsRouter;
