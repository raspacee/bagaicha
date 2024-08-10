import express from "express";
const router = express.Router();

import notificationController from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

/* Get a user's unread notifications */
router.get("/my", authMiddleware, notificationController.getNotifications);

/* Acknowledge that notification is read by user */
router.put("/my", authMiddleware, notificationController.readNotifications);

export default router;
