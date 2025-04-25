import { Request, Response } from 'express';
import { createGoogleEvents } from '../services/calendar.service';
import userModel from '../models/user.model';
import { oAuth2Client } from '../utils/googleClient';
import { AuthRequest } from "../types/AuthRequest";

export async function programarEventos(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { correosRelevantes } = req.body;
    const user = await userModel.findById(req.user?._id); // req.user viene de tu middleware de autenticación

    if (!user?.google) {
       res.status(401).json({ error: 'Usuario sin conexión a Google' });
       return
    }

    oAuth2Client.setCredentials({
      access_token: user.google.accessToken,
      refresh_token: user.google.refreshToken
    });

    await createGoogleEvents({
      oAuth2Client,
      userId: user._id.toString(),
      correosRelevantes
    });

    res.status(200).json({ message: 'Eventos programados correctamente' });
  } catch (error) {
    console.error('Error al programar eventos:', error);
    res.status(500).json({ error: 'Error interno' });
  }
}
