import express from "express";
const router = express.Router();

import notificationController from "../controllers/notificationController";
import { authMiddleware } from "../middlewares/authMiddleware";

router.get("/", authMiddleware, notificationController.get_notifications);
/* Acknowledge that notification is read by user */
router.get("/read", authMiddleware, notificationController.read_notification);

export default router;
