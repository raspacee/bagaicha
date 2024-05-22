import express from "express";
const router = express.Router();
import upload from "../multer";

import userController from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";

router.get("/:slug", userController.get_user_info);
router.post(
  "/profile-picture",
  authMiddleware,
  upload.single("profile-picture"),
  userController.change_profile_picture
);

export default router;
