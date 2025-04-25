import { Router } from 'express';
import { programarEventos } from '../controllers/calendar.controller';
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post('/calendar/sync', authMiddleware, programarEventos);

export default router;