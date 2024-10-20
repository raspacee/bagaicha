import express from "express";
const router = express.Router();
import upload from "../multer";

import userController from "../controllers/user.controller";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middlewares/auth.middleware";

/* Update a user's profile */
router.put(
  "/settings",
  authMiddleware,
  upload.single("newProfilePictureImage"),
  userController.updateUserProfile
);

/* Get posts of a user */
router.get(
  "/:userId/posts",
  optionalAuthMiddleware,
  userController.getUserPosts
);

/* Get info about logged in user */
router.get("/my", authMiddleware, userController.getMyUserData);

/* Get info about another user */
router.get("/:userId", userController.getUserData);

export default router;
