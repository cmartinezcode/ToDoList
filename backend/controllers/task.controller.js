import { z } from "zod";
import pool from "../db/db.js";

const createTaskSchema = z.object({
  name: z.string().trim().min(3, "Mínimo 3 caracteres").max(50, "Máximo 50 caracteres"),
  status: z.boolean(),
});

const updateTaskSchema = z.object({
  name: z.string().trim().min(3, "Mínimo 3 caracteres").max(50, "Máximo 50 caracteres"),
  status: z.boolean(),
});

export const getTasks = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY id DESC",
      [req.usuario.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener tareas" });
  }
};

export const createTask = async (req, res) => {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { name, status } = parsed.data;

    const result = await pool.query(
      "INSERT INTO tasks (name, status, user_id) VALUES ($1, $2, $3) RETURNING *",
      [name, status, req.usuario.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, req.usuario.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No tiene permiso para eliminar esta tarea" });
    }

    res.json({ message: `Tarea ${req.params.id} eliminada` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { name, status } = parsed.data;

    const result = await pool.query(
      "UPDATE tasks SET name = $2, status = $3 WHERE id = $1 AND user_id = $4 RETURNING *",
      [req.params.id, name, status, req.usuario.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.json({ message: `Tarea ${req.params.id} editada` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al editar" });
  }
};
