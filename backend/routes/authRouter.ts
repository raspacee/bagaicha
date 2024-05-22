import express from "express";
const router = express.Router();

import authController from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { modMiddleware } from "../middlewares/modMiddleware";

router.post("/signup", authController.signup_handler);
router.post("/login", authController.login_handler);
/* Verify if a access token is valid */
router.post("/authenticate", authMiddleware, authController.auth_handler);
/* Verify if a user is moderator */
router.post(
  "/moderator",
  authMiddleware,
  modMiddleware,
  authController.mod_authenticate,
);

export default router;
