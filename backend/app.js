import express from "express";
import pool from "./db/db.js";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

const verificarToken = (req, res, next) => {
  // 1. Leer la cabecera 'Authorization' que mandaste desde Axios
  const authHeader = req.headers['authorization'];
  
  // El header llega como "Bearer texto_del_token", así que lo separamos con split
  const token = authHeader && authHeader.split(' ')[1];

  // Si el Frontend no mandó ningún token
  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token inexistente.' });
  }

  try {
    // 2. Verificar si el token es real y no ha expirado
    const datosVerificados = jwt.verify(token, process.env.TOKEN);
    
    // 3. ¡ESTA ES LA MAGIA! Guardamos los datos del usuario dentro del 'req'
    // para que la siguiente función pueda saber quién es.
    req.usuario = datosVerificados; 
    
    next(); // Le dice a Express: "Todo en orden, continúa a la ruta de tareas"
  } catch (error) {
    res.status(403).json({ message: 'Token inválido o expirado' });
  }
};


app.get("/test", (req, res) => {
  res.json({ message: "backend vivo" });
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const query = "SELECT * FROM users WHERE username = $1";

    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      res.status(401).json({
        message: "El usuario no existe",
      });
      return;
    }

    const user = result.rows[0];
    const math = await bcrypt.compare(password, user.password);

    if (!math) {
       res.status(401).json({ message: "Contraseña inválida" });
       return;
    }

    const { id } = user;

    const token = jwt.sign(
      { id: id },
      process.env.TOKEN, // Usa una frase larga. En producción irá en un archivo .env
      { expiresIn: "2h" }, // El token vencerá en 2 horas por seguridad
    );

    res.status(200).json({
      message: `${id} Login success :)`,
      token: token,
      success:true
    });

  } catch (error) {
    // Por si falla la conexión a Postgres
    console.error("Error en el servidor:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (username === "" || password === "") {
    res.status(400).json({ message: "Todos los campos son obligatorios" });
    return;
  }

  const query = "SELECT * FROM users WHERE username = $1";
  const foundUser = await pool.query(query, [username]);

  if (foundUser.rows.length > 0) {
    res.status(401).json({
      message: "El usuario esta ocupado",
    });
    return;
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const query =
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username";
    const result = await pool.query(query, [username, passwordHash]);

    res.status(201).json({
      success: true,
      message: "¡Usuario registrado con éxito!",
      user: result.rows[0], // Devolvemos el ID y nombre (¡nunca el hash!)
    });
  } catch (error) {}
});




app.get("/tasks",verificarToken, async (req, res) => {
  try {

    // Graicas al middleware, el ID del usuario viene seguro en 'req.usuario.id'
    const usuarioId = req.usuario.id;

    const result = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY id DESC",
      [usuarioId],
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

app.post("/tasks", verificarToken ,async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { name, status } = req.body; // DESESCTRUTURACION

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Nombre inválido" });
    }

    const trimmed = name.trim();
    const user = parseInt(usuarioId);

    if (trimmed.length === 0) {
      return res.status(400).json({ error: "La tarea no puede estar vacía" });
    }

    if (trimmed.length < 3) {
      return res.status(400).json({ error: "Mínimo 3 caracteres" });
    }

    if (trimmed.length > 50) {
      return res.status(400).json({ error: "Máximo 50 caracteres" });
    }

    const result = await pool.query(
      "INSERT INTO tasks (name, status, user_id) VALUES ($1 , $2, $3) RETURNING *",
      [trimmed, status, user],
    );

    res.json(result.rows[0]); // devuelve lo guardado
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error al guardar" });
  }
});

app.delete("/tasks/:id", verificarToken, async (req, res) => {
  const id = req.params.id;
  const usuarioId = req.usuario.id;

  const result = await pool.query(
    " DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, usuarioId],
  );
  
  res.json({ message: `Tarea ${id} eliminada` });
  if (result.rowCount === 0) {
    res
      .status(404)
      .json({ message: "No tiene permiso para eliminar esta tarea" });
  }
});

app.put("/tasks/:id", verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { id } = req.params;
  const { name, status } = req.body;

  await pool.query(
    "UPDATE tasks SET name = $2, status = $3 WHERE id = $1 and user_id = $4 RETURNING *",
    [id, name, status, usuarioId],
  );
  res.json({ message: `Tarea ${id} editada` });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listeng server in port ${PORT}`);
});
