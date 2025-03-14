import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { AuthRequest } from "../types/AuthRequest";

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Acceso denegado. No hay token." });
      return; // Agregamos `return` para evitar continuar la ejecución
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401).json({ message: "Usuario no autorizado" });
      return;
    }

    next(); // Pasar al siguiente middleware
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
};

export default authMiddleware;
