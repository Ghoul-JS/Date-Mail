import { Response } from "express";
import Event from "../models/event.model";
import { AuthRequest } from "../types/AuthRequest";

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Usuario no autorizado" });
      return;
    }
    
    const events = await Event.find({ userId: req.user.id });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener eventos" });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Usuario no autorizado" });
      return;
    }

    const { title, description, date, source } = req.body;
    const newEvent = new Event({
      userId: req.user.id,
      title,
      description,
      date,
      source,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Error al crear evento" });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Usuario no autorizado" });
      return;
    }

    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.json({ message: "Evento eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar evento" });
  }
};
