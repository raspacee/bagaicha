import express from "express";
const router = express.Router();
import upload from "../multer";

import postController from "../controllers/post.controller";
import commentController from "../controllers/comment.controller";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middlewares/auth.middleware";

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  postController.createMyPost
);

router.post("/:postId/likes", authMiddleware, postController.likePost);
router.delete("/:postId/likes", authMiddleware, postController.unlikePost);

router.get("/", optionalAuthMiddleware, postController.getFeed);

/* Bookmark a review */
router.post("/:postId/bookmarks", authMiddleware, postController.bookmarkPost);
router.delete(
  "/:postId/bookmarks",
  authMiddleware,
  postController.unbookmarkPost
);

/* Get all bookmarked reviews by a user */
router.get("/bookmarks", authMiddleware, postController.getMyBookmarks);

router.get(
  "/:review_id/comments",
  authMiddleware,
  commentController.get_review_comments
);

/* Create a comment */
router.post("/comments", authMiddleware, commentController.createComment);

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

router.get("/:postId", optionalAuthMiddleware, postController.getSinglePost);

router.put("/:postId", authMiddleware, postController.updateMyPost);

router.delete("/:postId", authMiddleware, postController.deleteMyPost);

export default router;
