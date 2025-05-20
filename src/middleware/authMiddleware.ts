import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { AuthRequest } from "../types/AuthRequest";

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token desde cookies o header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log("⛔ No se encontró token en la petición");
      res.status(401).json({ message: "Acceso denegado. No hay token." });
      return;
    }

    console.log("🟢 Token recibido:", token);
    console.log("🔐 JWT_SECRET usado:", process.env.JWT_SECRET);

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;

    console.log("📨 Token decodificado:", decoded);

    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      console.log("❌ Token inválido o sin campo 'id'");
      res.status(401).json({ message: "Token inválido o sin ID" });
      return;
    }

    const userId = decoded.id as string;
    console.log("🔎 ID extraído del token:", userId);

    // [Opcional de depuración] Ver usuarios en la base de datos
    const allUsers = await User.find();
  
    req.user = await User.findById(userId).select("-password") as IUser;

    if (!req.user) {
      console.log("❌ No se encontró usuario con ese ID");
      res.status(401).json({ message: "Usuario no autorizado" });
      return;
    }

    console.log("✅ Usuario autenticado:", req.user.email);

    next(); 
  } catch (error) {
    console.error("❌ Error al verificar el token:", error);
    res.status(401).json({ message: "Token inválido" });
  }
};

export default authMiddleware;
