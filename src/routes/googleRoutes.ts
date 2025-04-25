import express from "express";
import { googleAuth, googleCallback } from "../controllers/googleAuth.controller";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// Ruta que redirige a Google para autenticar
router.get("/auth/google", googleAuth);

// Ruta que maneja el retorno de Google (requiere que el usuario ya esté logueado)
router.get("/auth/google/callback", /* authMiddleware, */ googleCallback);

export default router;