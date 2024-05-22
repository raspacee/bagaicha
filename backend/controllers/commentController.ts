import { NextFunction, Request, Response } from "express";

import { pool } from "../db";
import Comment from "../models/commentModel";
import CommentLike from "../models/commentLikeModal";
import Notification, { NotificationObject } from "../models/notificationModel";

const get_review_comments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const comments = await Comment.get_comments(
      req.params.review_id as string,
      res.locals.user.user_id,
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

const create_comment = async (req: Request, res: Response) => {
  try {
    const review_id = req.params.review_id;
    const { comment_body } = req.body;

    const comment = await Comment.create_comment(
      review_id,
      res.locals.user.user_id,
      comment_body,
      null,
    );
    const victim = await pool.query(
      `select author_id from review where id = $1`,
      [review_id],
    );
    if (victim.rows[0].author_id != res.locals.user.user_id) {
      await Notification.create_notification(
        res.locals.user.user_id,
        victim.rows[0].author_id,
        NotificationObject.Review,
        review_id,
        "comment",
      );
    }
    comment[0].author_picture_url = res.locals.user.profile_picture_url;
    return res.status(201).send({
      status: "ok",
      comment: comment[0],
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const reply_comment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const comment_id = req.params.comment_id;
    const review_id = req.params.review_id;
    const { comment_body } = req.body;

    const reply = await Comment.create_comment(
      review_id,
      res.locals.user.user_id,
      comment_body,
      parseInt(comment_id),
    );
    reply[0].author_picture_url = res.locals.user.profile_picture_url;
    return res.status(201).send({
      status: "ok",
      reply: reply[0],
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const get_replies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { comment_id, review_id } = req.params;

    const replies = await Comment.get_replies(
      parseInt(comment_id),
      res.locals.user.user_id,
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
  next: NextFunction,
) => {
  try {
    /* Check if the user has liked the review already */
    const { review_id, comment_id } = req.params;
    console.log(review_id, comment_id);
    const has_liked = await Comment.user_has_liked_comment(
      res.locals.user.user_id,
      parseInt(comment_id),
    );
    if (!has_liked) {
      await CommentLike.create_like(res.locals.user.user_id, comment_id);
      const victim = await pool.query(
        `select author_id from review_comment where id = $1`,
        [comment_id],
      );
      if (victim.rows[0].author_id != res.locals.user.user_id) {
        await Notification.create_notification(
          res.locals.user.user_id,
          victim.rows[0].author_id,
          NotificationObject.Comment,
          comment_id,
          "like",
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
  create_comment,
  reply_comment,
  get_replies,
  like_comment,
};

export default exporter;
