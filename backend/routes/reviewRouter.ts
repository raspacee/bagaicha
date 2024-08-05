import express from "express";
const router = express.Router();
import upload from "../multer";

import reviewController from "../controllers/reviewController";
import commentController from "../controllers/commentController";
import { authMiddleware } from "../middlewares/authMiddleware";

router.post(
  "/",
  authMiddleware,
  upload.single("picture"),
  reviewController.create_handler
);

router.post("/like", authMiddleware, reviewController.like_review);

router.get("/", authMiddleware, reviewController.get_handler);

/* Bookmark a review */
router.post("/bookmark", authMiddleware, reviewController.bookmark_handler);

/* Get all bookmarked reviews by a user */
router.get("/bookmark", authMiddleware, reviewController.get_bookmarks);

router.get(
  "/:review_id/comments",
  authMiddleware,
  commentController.get_review_comments
);

/* Create a comment */
router.post(
  "/:review_id/comments",
  authMiddleware,
  commentController.create_comment
);

/* Reply to a comment */
router.post(
  "/:review_id/comments/:comment_id",
  authMiddleware,
  commentController.reply_comment
);

/* Get comments replies */
router.get(
  "/:review_id/comments/:comment_id",
  authMiddleware,
  commentController.get_replies
);

router.post(
  "/:review_id/comments/:comment_id/like",
  authMiddleware,
  commentController.like_comment
);

router.get("/:postId", reviewController.getSinglePost);

export default router;
