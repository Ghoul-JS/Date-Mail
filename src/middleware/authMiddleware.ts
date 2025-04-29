import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { AuthRequest } from "../types/AuthRequest";

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

    if (!token) {
      res.status(401).json({ message: "Acceso denegado. No hay token." });
      return;
    }
    console.log(token);
    console.log(process.env.JWT_SECRET);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    console.log(decoded);
    
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      res.status(401).json({ message: "Token inválido o sin ID" });
      return;
    }

    const userId = decoded.id as string;
    req.user = await User.findById(userId).select("-password");

    if (!req.user) {
      res.status(401).json({ message: "Usuario no autorizado" });
      return;
    }

    next(); 
  } catch (error) {
    console.error("❌ Error al verificar el token:", error);
    res.status(401).json({ message: "Token inválido" });
  }
};

export default authMiddleware;
