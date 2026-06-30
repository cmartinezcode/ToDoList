import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, register } from "../controllers/auth.controller.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 6,
  message: { message: "Demasiados intentos, intenta de nuevo en 30 minutos" },
});

router.post("/login", loginLimiter, login);
router.post("/register", register);

export default router;
