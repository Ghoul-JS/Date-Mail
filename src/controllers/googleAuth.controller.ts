import { google } from "googleapis";
import { Request, Response } from "express";
import User from "../models/user.model";
import jwt from "jsonwebtoken";


const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar"
];

export const googleAuth = (req: Request, res: Response) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES
  });

  res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code as string;

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
       res.status(400).json({ message: "No se obtuvo token de acceso de Google" });
       return
    }

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data: userInfo } = await oauth2.userinfo.get();

    const { email, name, picture } = userInfo;

    if (!email) {
       res.status(400).json({ message: "No se pudo obtener el correo del usuario" });
       return
    }

    console.log("📨 Usuario desde Google:", email, name);

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name: name ?? '', image: picture ?? '' });
    } else {
      user.name = name ?? user.name; // por si cambió
      user.image = picture ?? user.image;
    }

    user.google = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? user.google?.refreshToken,
      tokenExpiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    };

    await user.save();

    const appToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Autenticación con Google exitosa",
      token: appToken,
    });

  } catch (error: any) {
    console.error("❗ Error en callback Google:", error?.response?.data || error.message);
    res.status(500).json({
      message: "Error al obtener datos del usuario",
      error: error?.response?.data || error.message,
    });
  }
};
