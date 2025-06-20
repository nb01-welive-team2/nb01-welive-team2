import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import cors from "cors";
import cookieParser from "cookie-parser";
// import { UPLOAD_FOLDER, STATIC_PATH } from './config/constants';
// import usersRouter from './routers/userRouter';
// import pollsRouter from "./routes/pollRouter";
import noticesRouter from "./routes/noticeRouter";
// import pollsRouter from "./routes/pollRouter";
// import commentsRouter from './routers/commentRouter';
// import imagesRouter from './routers/imageRouter';
// import notificationsRouter from './routers/notificationRouter';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from "./controllers/errorController";
import residentsRouter from "./routes/residentsRouter";
import authRouter from "./routes/authRoute";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/residents", residentsRouter);
// app.use('/users', usersRouter);

// app.use("/api/polls", pollsRouter);
app.use("/api/notices", noticesRouter);
// app.use("/api/polls", pollsRouter);
// app.use("/api/notices", noticesRouter);

// app.use('/comments', commentsRouter);
// app.use('/images', imagesRouter);
// app.use('/notifications', notificationsRouter);

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

export default app;
