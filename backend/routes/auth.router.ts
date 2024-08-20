import express from "express";
const router = express.Router();

import authController from "../controllers/auth.controller";
import {
  authMiddleware,
  verifyAdminMiddleware,
} from "../middlewares/auth.middleware";
import { modMiddleware } from "../middlewares/modMiddleware";

router.post("/signup", authController.signupHandler);
router.post("/login", authController.loginHandler);
/* Verify if a access token is valid */
router.post("/authenticate", authMiddleware, authController.auth_handler);
/* Verify if a user is moderator */
router.post(
  "/moderator",
  authMiddleware,
  modMiddleware,
  authController.mod_authenticate
);
/* Verify a admin */
router.post(
  "/admin",
  authMiddleware,
  verifyAdminMiddleware,
  authController.adminHandler
);

router.post("/forgot-password", authController.getResetPasswordToken);

router.post("/reset-password/:resetToken", authController.resetPassword);

export default router;
