import express from "express";
import gmailApiController from "../controllers/gmailApiController"
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.get("/mail/list/:email", authMiddleware, gmailApiController.getMails);
router.get("/mail/read/:email/:messageId", authMiddleware, gmailApiController.readMail);

export default router;