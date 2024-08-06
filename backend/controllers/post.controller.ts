import path from "path";
import { DateTime } from "luxon";
import { NextFunction, Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";

import Place from "../models/place.model";
import PostModel from "../models/post.model";
import Like from "../models/likeModel";
import ReviewBookmark from "../models/reviewBookmarkModel";
import Comment from "../models/commentModel";
import Notification, { NotificationObject } from "../models/notificationModel";
import { pool } from "../db";
import { CreatePostForm, Post } from "../types";

/* create a post */
const createMyPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { placeName, placeId, body, rating }: CreatePostForm = req.body;

    const place = await Place.getPlacebyId(placeId);
    if (!place) {
      return res.status(400).json({
        message: "Bad placeId",
      });
    }

    /* Upload the image */
    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    /* create the post */
    const createdPost = await PostModel.createPost(
      req.jwtUserData!.userId,
      body,
      rating,
      imageUrl,
      placeId
    );
    return res.status(201).json(createdPost);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error while creating a post",
    });
  }
};

function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // distance between latitudes
  // and longitudes in km
  let dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  let dLon = ((lon2 - lon1) * Math.PI) / 180.0;

  // convert to radiansa
  lat1 = (lat1 * Math.PI) / 180.0;
  lat2 = (lat2 * Math.PI) / 180.0;

  // apply formula
  let a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
  let rad = 6371;
  let c = 2 * Math.asin(Math.sqrt(a));
  return parseFloat((rad * c).toFixed(1));
}

export const place_features = [
  { key: "delivery", value: 0 },
  { key: "takeout", value: 1 },
  { key: "pet_friendly", value: 2 },
  { key: "very_clean", value: 3 },
  { key: "affordable", value: 4 },
];

const getFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sort = req.query.sort;
    const lat = req.query.lat as string;
    const long = req.query.long as string;
    const posts = await PostModel.getFeedPosts(req.jwtUserData!.userId);
    if (posts.length == 0 || sort == "recent") {
      return res.json(posts);
    }

    /* Feed algorithm */
    for (let i = 0; i < posts.length; i++) {
      let geo_point: number;
      if (req.query.lat && req.query.long) {
        /* Calculating distance between the points and converting it to meters */
        const diff_dist =
          haversine(
            parseFloat(lat),
            parseFloat(long),
            posts[i].lat,
            posts[i].lon
          ) * 1000;
        geo_point = 10000 - diff_dist;
      } else {
        /* If user does not provide location, random geo point is calculated */
        geo_point = Math.floor(Math.random() * 4001 + 2000);
      }
      const review_datetime = DateTime.fromISO(posts[i].createdAt);
      const curr_datetime = DateTime.fromISO(DateTime.local().toISO());
      const diff = curr_datetime.diff(review_datetime);
      const time_passed_mins = diff.toObject().milliseconds! / 1000 / 60;
      const score = (posts[i].likeCount * geo_point) / time_passed_mins;
      posts[i].score = score;
    }
    posts.sort((a, b) => {
      if (a.score > b.score) return -1;
      else return 1;
    });
    return res.json(posts);
  } catch (err: any) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      message: err.message,
    });
  }
};

/* Handle liking/unliking a review by a user */
const like_review = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /* Check if the user has liked the review already */
    const { review_id } = req.body;
    const userId = req.jwtUserData!.userId;
    const has_liked = await Like.user_has_liked_review(userId, review_id);
    if (!has_liked) {
      await Like.create_like(userId, review_id);
      const victim = await pool.query(
        `select author_id from review where id = $1`,
        [review_id]
      );
      if (victim.rows[0].author_id != userId) {
        await Notification.create_notification(
          userId,
          victim.rows[0].author_id,
          NotificationObject.Review,
          review_id,
          "like"
        );
      }
      return res.status(201).json();
    } else {
      await Like.delete_like(userId, review_id);
      return res.status(204).json();
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

const bookmark_handler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /* Check if the user has liked the review already */
    const { review_id } = req.body;
    if (review_id == undefined) {
      throw new Error("Review ID is empty");
    }
    const has_bookmarked = await ReviewBookmark.user_has_bookmarked_review(
      res.locals.user.user_id,
      review_id
    );
    if (!has_bookmarked) {
      const created_at = new Date().toISOString();
      await ReviewBookmark.create_bookmark(
        res.locals.user.user_id,
        review_id,
        created_at
      );
      return res.status(200).send({
        status: "ok",
        action: "bookmark",
        message: "Bookmarked the review",
      });
    } else {
      await ReviewBookmark.delete_bookmark(res.locals.user.user_id, review_id);
      return res.status(200).send({
        status: "ok",
        action: "unbookmark",
        message: "Unbookmarked dthe review",
      });
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

const get_bookmarks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = res.locals.user.user_id;

    const bookmarks = await ReviewBookmark.get_bookmarks(user_id);
    return res.status(200).send({
      status: "ok",
      bookmarks,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      message: err,
    });
  }
};

const getSinglePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = req.params.postId;
    const post = await PostModel.getPostById(
      postId,
      req.jwtUserData?.userId || null
    );
    if (post == null) res.status(404).send();
    const comments = await Comment.getCommentsOfPost(
      postId,
      req.jwtUserData?.userId || null
    );
    post!.comments = comments;
    return res.json(post);
  } catch (err) {
    console.error(err);
    return next("Error while fetching post by id");
  }
};

const uploadImage = async (image: Express.Multer.File) => {
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;
  const uploadResponse = await cloudinary.uploader.upload(dataURI);
  return uploadResponse.secure_url;
};

const exporter = {
  createMyPost,
  getFeed,
  like_review,
  bookmark_handler,
  get_bookmarks,
  getSinglePost,
};

export default exporter;
