import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import cors from "cors";
import cookieParser from "cookie-parser";
import noticesRouter from "./routes/noticeRouter";
import complaintsRouter from "./routes/complaintRouter";
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from "./controllers/errorController";
import residentsRouter from "./routes/residentsRouter";
import authRouter from "./routes/authRoute";
import userRouter from "./routes/userRoute";
import apartmentsRouter from "./routes/apartmentInfoRoute";
import pollsRouter from "./routes/pollRouter";
import imagesRouter from "./routes/imageRouter";
import { PUBLIC_PATH } from "./lib/constance";
import eventsRouter from "./routes/eventRouter";
import { seedDatabase } from "../prisma/seed";
import { renderHtmlWithUrl } from "./lib/htmlRenderer";
import optionsRouter from "./routes/optionRouter";
import commentRouter from "./routes/commentRouter";
import notificationsRouter from "./routes/notificationRouter";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/auth", userRouter);
app.use("/api/residents", residentsRouter);
app.use("/api/apartments", apartmentsRouter);
app.use("/api/users", userRouter);
app.use("/api/polls", pollsRouter);
app.use("/api/notices", noticesRouter);
app.use("/api/complaints", complaintsRouter);
app.use("/api/users", imagesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/options", optionsRouter);
app.use("/api/comments", commentRouter);

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/seed", async (req, res) => {
  await seedDatabase();
  res.send({ message: "Seeding completed." });
});
app.get("/sse", (req, res) => {
  const html = renderHtmlWithUrl("sse-client-test.html");
  res.send(html);
});
app.get("/", (req, res) => {
  const html = renderHtmlWithUrl("index.html");
  res.send(html);
});

app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

export default app;
