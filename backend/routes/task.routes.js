import { Router } from "express";
import verificarToken from "../middleware/verificarToken.js";
import { getTasks, createTask, deleteTask, updateTask } from "../controllers/task.controller.js";

const router = Router();

router.use(verificarToken);

router.get("/tasks", getTasks);
router.post("/tasks", createTask);
router.delete("/tasks/:id", deleteTask);
router.put("/tasks/:id", updateTask);

export default router;
