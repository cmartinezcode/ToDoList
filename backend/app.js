import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  res.json({ message: "backend vivo" });
});

app.use(authRoutes);
app.use(taskRoutes);

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
