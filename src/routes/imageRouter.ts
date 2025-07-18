import uploadImage from "@/controllers/imageController";
import { withAsync } from "@/lib/withAsync";
import { authenticate } from "@/middlewares/authenticate";
import { uploader } from "@/middlewares/uploader";
import express from "express";

const imagesRouter = express.Router();

imagesRouter.patch(
  "/avatar",
  authenticate({ optional: false }),
  uploader.single("image"),
  withAsync(uploadImage)
);

export default imagesRouter;
