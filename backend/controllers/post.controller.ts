import { DateTime } from "luxon";
import { NextFunction, Request, Response } from "express";

import PlaceModel from "../models/place.model";
import PostModel from "../models/post.model";
import LikeModel from "../models/like.model";
import BookmarkModel from "../models/bookmark.model";
import CommentModel from "../models/comment.model";
import NotificationModel from "../models/notification.model";
import {
  CreatePostForm,
  EditPostForm,
  FetchFeedResponse,
  Notification,
  Post,
} from "../types";
import { uploadImage } from "../utils/image";

/* create a post */
const createMyPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { placeName, placeId, body, rating }: CreatePostForm = req.body;

    const place = await PlaceModel.getPlacebyId(placeId);
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

const getFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sort = req.query.sort;
    const lat = req.query.lat as string;
    const long = req.query.long as string;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 20;

    const posts = await PostModel.getFeedPosts(
      req.jwtUserData!.userId,
      (page - 1) * pageSize
    );
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

    /* For infinite scrolling */
    const remainingFeedPosts = await PostModel.getRemainingFeedPosts(
      (page - 1) * posts.length
    );
    let nextPage: number | null = null;
    if (remainingFeedPosts > 0) nextPage = page + 1;
    return res.json({ posts, nextPage: nextPage } as FetchFeedResponse);
  } catch (err: any) {
    console.log(err);
    return res.status(500).send({
      status: "error",
      message: err.message,
    });
  }
};

const likePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const post = await PostModel.getPostById(postId, null);
    if (!post) {
      return res.status(404).json({
        message: "Post ID not found",
      });
    }
    await LikeModel.createPostLike(postId, req.jwtUserData!.userId);

    if (post.authorId !== req.jwtUserData!.userId) {
      /* Send a notification */
      const notification: Notification = {
        senderId: req.jwtUserData!.userId,
        recipientId: post.authorId,
        type: "UserLikesPost",
        postId: postId,
        isRead: false,
      };
      await NotificationModel.createNotification(notification);
    }
    return res.status(201).json();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while liking a post",
    });
  }
};

const unlikePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const post = await PostModel.getPostById(postId, null);
    if (!post) {
      return res.status(404).json({
        message: "Post ID not found",
      });
    }
    await LikeModel.deletePostLike(postId, req.jwtUserData!.userId);
    return res.status(204).json();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while liking a post",
    });
  }
};

const bookmarkPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const post = await PostModel.getPostById(postId, null);
    if (!post) {
      return res.status(400).json({
        message: "Post ID not found",
      });
    }
    await BookmarkModel.createPostBookmark(postId, req.jwtUserData!.userId);

    return res.status(201).send();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while bookmarking a post",
    });
  }
};

const unbookmarkPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const post = await PostModel.getPostById(postId, null);
    if (!post) {
      return res.status(400).json({
        message: "Post ID not found",
      });
    }
    await BookmarkModel.deletePostBookmark(postId, req.jwtUserData!.userId);

    return res.status(201).send();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error while bookmarking a post",
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
    if (post == null) return res.status(404).json();
    const comments = await CommentModel.getCommentsOfPost(
      postId,
      req.jwtUserData?.userId || null
    );
    post.comments = comments;
    return res.json(post);
  } catch (err) {
    console.error(err);
    return next("Error while fetching post by id");
  }
};

const updateMyPost = async (req: Request, res: Response) => {
  try {
    const form: EditPostForm = req.body as EditPostForm;
    const { postId } = req.params;

    const post = await PostModel.getPostById(postId, null);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.authorId !== req.jwtUserData!.userId) {
      return res.status(403).json({ message: "You cannot update this post" });
    }

    await PostModel.updatePostById(form, postId);
    return res.status(200).json();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error while updating post",
    });
  }
};

const deleteMyPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const post = await PostModel.getPostById(postId, null);

    if (!post)
      return res.status(404).json({
        message: "Post not found",
      });

    if (post.authorId !== req.jwtUserData!.userId) {
      return res.status(403).json({ message: "You cannot delete this post" });
    }

    await PostModel.deletePostById(postId);
    return res.status(204).json();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error while deleting post",
    });
  }
};

const getMyBookmarks = async (req: Request, res: Response) => {
  try {
    const posts = await BookmarkModel.getBoomarksOfUser(
      req.jwtUserData!.userId
    );
    return res.json(posts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error while getting bookmarks",
    });
  }
};

const exporter = {
  createMyPost,
  getFeed,
  likePost,
  unlikePost,
  getSinglePost,
  bookmarkPost,
  unbookmarkPost,
  updateMyPost,
  deleteMyPost,
  getMyBookmarks,
};

export default exporter;
