import express from "express";
const router = express.Router();
import upload from "../multer";

import userController from "../controllers/userController";
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

/* Get reviews posted by a user */
router.get(
  "/:user_email/reviews",
  authMiddleware,
  userController.get_user_reviews
);

/* Get info about logged in user */
router.get("/my", authMiddleware, userController.getMyUserData);

/* Get info about another user */
router.get("/:slug", userController.get_user_info);

export default router;
