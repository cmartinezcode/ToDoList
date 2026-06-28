import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/db.js";

const loginSchema = z.object({
  username: z.string().trim().min(1, "El usuario es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

const registerSchema = z.object({
  username: z.string().trim().min(3, "Mínimo 3 caracteres").max(30),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const login = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const { username, password } = parsed.data;

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "El usuario no existe" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Contraseña inválida" });
    }

    const token = jwt.sign({ id: user.id }, process.env.TOKEN, { expiresIn: "2h" });

    res.status(200).json({ message: "Login exitoso", token, success: true });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const register = async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const { username, password } = parsed.data;

    const foundUser = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (foundUser.rows.length > 0) {
      return res.status(401).json({ message: "El usuario está ocupado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, passwordHash]
    );

    res.status(201).json({
      success: true,
      message: "¡Usuario registrado con éxito!",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
