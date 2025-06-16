import express from "express";
import cors from "cors";
import { PORT } from "./lib/constance";

const app = express();

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server running ${PORT}...`);
});
