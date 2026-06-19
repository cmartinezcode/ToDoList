import express from "express";
import pool from "./db/db.js";
import cors from "cors";
import "dotenv/config";

const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cors());

app.get("/users", async (req, res) => {
  const result = await pool.query("SELECT * FROM users");
  res.json(result.rows);
});

app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Nombre inválido" });
    }
    const trimmed = name.trim();

    if (trimmed.length === 0) {
      return res.status(400).json({ error: "La tarea no puede estar vacía" });
    }

    if (trimmed.length < 3) {
      return res.status(400).json({ error: "Mínimo 3 caracteres" });
    }

    if (trimmed.length > 100) {
      return res.status(400).json({ error: "Máximo 100 caracteres" });
    }

    const result = await pool.query(
      "INSERT INTO tasks (name) VALUES ($1) RETURNING *",
      [trimmed],
    );
    res.json(result.rows[0]); // devuelve lo guardado
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error al guardar" });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  const id = req.params.id;

  await pool.query(" DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);
  console.log(id);
  res.json({ message: `Tarea ${id} eliminada` });
});

app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  await pool.query(
    "UPDATE tasks SET name = $2, status = $3 WHERE id = $1 RETURNING *",
    [id, name, status]
  );
  res.json({ message: `Tarea ${id} editada` });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Listeng server in port ${PORT}`);
});
