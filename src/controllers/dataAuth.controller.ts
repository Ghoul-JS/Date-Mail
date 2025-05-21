import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { Request, Response, NextFunction } from 'express';

export const dataAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 🔄 Acepta el token desde cookie o desde header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Token requerido' });
      return;
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.id).select('name email image');

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

