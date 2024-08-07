import express from "express";
const router = express.Router();
import upload from "../multer";

import userController from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

router.post(
  "/profile-picture",
  authMiddleware,
  upload.single("profile-picture"),
  userController.change_profile_picture
);

/* Update a user's profile */
router.put(
  "/settings",
  authMiddleware,
  upload.fields([{ name: "new_profile_pic", maxCount: 1 }]),
  userController.update_profile
);

/* Get posts of a user */
router.get("/:userId/posts", authMiddleware, userController.getUserPosts);

/* Get info about logged in user */
router.get("/my", authMiddleware, userController.getMyUserData);

/* Get info about another user */
router.get("/:userId", userController.getUserData);

export default router;
