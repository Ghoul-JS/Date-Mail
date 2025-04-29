import express from "express";
import { dataAuth } from "../controllers/dataAuth.controller";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.get("/dataUser",authMiddleware, dataAuth);

export default router;