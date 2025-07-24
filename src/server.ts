import dotenv from "dotenv";
import { createServer } from "http";
import app from "./app";
import { PORT } from "./lib/constance";

dotenv.config();

const server = createServer(app);

// registerSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
