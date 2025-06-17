import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import cors from "cors";
import cookieParser from "cookie-parser";
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from "./controllers/errorController";
import residentsRouter from "./routes/residentsRouter";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/residents", residentsRouter);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

export default app;
