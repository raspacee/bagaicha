import { NextFunction, Request, Response } from "express";

import { pool } from "../db";
import CommentModel from "../models/comment.model";
import CommentLike from "../models/commentLikeModal";
import Notification, { NotificationObject } from "../models/notificationModel";
import { CommentForm } from "../types";

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

    await CommentModel.createCommentOnPost(commentForm, userId);
    //TODO: FIX THE NOTIFICATION
    // const victim = await pool.query(
    //   `select author_id from post where id = $1`,
    //   [postId]
    // );
    // if (victim.rows[0].author_id != userId) {
    //   await Notification.create_notification(
    //     res.locals.user.user_id,
    //     victim.rows[0].author_id,
    //     NotificationObject.Post,
    //     postId,
    //     "comment"
    //   );
    // }
    return res.status(201).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send({
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
      const victim = await pool.query(
        `select author_id from review_comment where id = $1`,
        [comment_id]
      );
      if (victim.rows[0].author_id != res.locals.user.user_id) {
        await Notification.create_notification(
          res.locals.user.user_id,
          victim.rows[0].author_id,
          NotificationObject.Comment,
          comment_id,
          "like"
        );
      }
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
