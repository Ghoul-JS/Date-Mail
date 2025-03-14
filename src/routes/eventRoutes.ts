import express from "express";
import { getEvents, createEvent, deleteEvent } from "../controllers/eventController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getEvents);
router.post("/", authMiddleware, createEvent);
router.delete("/:id", authMiddleware, deleteEvent);

export default router;