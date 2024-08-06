import express from "express";
const router = express.Router();
import upload from "../multer";

import postController from "../controllers/post.controller";
import commentController from "../controllers/commentController";
import { authMiddleware } from "../middlewares/authMiddleware";

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  postController.createMyPost
);

router.post("/like", authMiddleware, postController.like_review);

router.get("/", authMiddleware, postController.getFeed);

/* Bookmark a review */
router.post("/bookmark", authMiddleware, postController.bookmark_handler);

/* Get all bookmarked reviews by a user */
router.get("/bookmark", authMiddleware, postController.get_bookmarks);

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

router.get("/:postId", postController.getSinglePost);

export default router;
