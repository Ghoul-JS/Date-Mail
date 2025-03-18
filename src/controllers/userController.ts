import { Request, Response } from "express";
import User, { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../types/AuthRequest";

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "30d" });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "El usuario ya existe" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // const user = await User.create({ name, email, password: hashedPassword }) as IUser;

    const user = new User({
      name, 
      email, 
      password: hashedPassword
    })

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user,
      token: generateToken(user.id),
    });

    // if (user) {
    //   res.status(201).json({
    //     _id: user.id,
    //     name: user.name,
    //     email: user.email,
    //     token: generateToken(user.id),
    //   });
    // } else {
    //   res.status(400).json({ message: "No se pudo registrar el usuario" });
    // }
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }) as IUser | null | any;

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Credenciales incorrectas" });
    }
  } catch (error) {
    console.error("Error en registerUser:", error); // <-- Agrega esto
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser | null | any;

    if (!user) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};
