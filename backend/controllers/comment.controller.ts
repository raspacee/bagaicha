import { NextFunction, Request, Response } from "express";

import CommentModel from "../models/comment.model";
import CommentLike from "../models/commentLikeModal";
import NotificationModel from "../models/notification.model";
import PostModel from "../models/post.model";
import { CommentForm } from "../types";
import { Notification } from "../types";

const get_review_comments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Hitting get_review_comments");
  try {
    const comments = await CommentModel.get_comments(
      req.params.review_id as string,
      res.locals.user.user_id
    );
    return res.status(200).send({
      status: "ok",
      comments,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const createComment = async (req: Request, res: Response) => {
  try {
    const commentForm: CommentForm = req.body;
    const userId = req.jwtUserData!.userId;

    const post = await PostModel.getPostById(commentForm.postId, null);
    if (!post) {
      return res.status(404).json();
    }

    await CommentModel.createCommentOnPost(commentForm, userId);

    if (post.authorId !== req.jwtUserData!.userId) {
      const notification: Notification = {
        recipientId: post.authorId,
        senderId: userId,
        type: "UserCommentsOnPost",
        isRead: false,
        postId: post.id,
      };
      await NotificationModel.createNotification(notification);
    }

    return res.status(201).json();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: err,
    });
  }
};

const get_replies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { comment_id, review_id } = req.params;

    const replies = await CommentModel.get_replies(
      parseInt(comment_id),
      res.locals.user.user_id
    );

    return res.status(200).send({
      status: "ok",
      replies,
    });
  } catch (err) {
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const like_comment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /* Check if the user has liked the review already */
    const { review_id, comment_id } = req.params;
    console.log(review_id, comment_id);
    const has_liked = await CommentModel.user_has_liked_comment(
      res.locals.user.user_id,
      parseInt(comment_id)
    );
    if (!has_liked) {
      await CommentLike.create_like(res.locals.user.user_id, comment_id);
      // const victim = await pool.query(
      //   `select author_id from review_comment where id = $1`,
      //   [comment_id]
      // );
      // if (victim.rows[0].author_id != res.locals.user.user_id) {
      //   await Notification.create_notification(
      //     res.locals.user.user_id,
      //     victim.rows[0].author_id,
      //     NotificationObject.Comment,
      //     comment_id,
      //     "like"
      //   );
      // }
      return res.status(200).send({
        status: "ok",
        action: "like",
        message: "Loved the comment",
      });
    } else {
      await CommentLike.delete_like(res.locals.user.user_id, comment_id);
      return res.status(200).send({
        status: "ok",
        action: "unlike",
        message: "Unloved the comment",
      });
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

const exporter = {
  get_review_comments,
  createComment,
  get_replies,
  like_comment,
};

export default exporter;
