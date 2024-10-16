import {
  CreatePlaceReviewForm,
  createPlaceReviewSchema,
  ReviewFilterBy,
  ReviewSortBy,
} from "../types";
import PlaceReviewModel from "../models/placeReview.model";
import UserModel from "../models/user.model";
import { uploadImage } from "../utils/image";
import { z } from "zod";
import { USER_LEVELS } from "../utils/config";
import { Request, Response } from "express";

const createPlaceReview = async (req: Request, res: Response) => {
  try {
    const form: CreatePlaceReviewForm = req.body as CreatePlaceReviewForm;
    form.rating = parseInt(req.body.rating);
    form.placeId = req.params.placeId;
    form.createdAt = new Date().toISOString();

    createPlaceReviewSchema.parse(form);

    if (req.file as Express.Multer.File) {
      const [url] = await uploadImage(req.file as Express.Multer.File);
      form.imageUrl = url;
    }

    await PlaceReviewModel.createReview(form, req.jwtUserData!.userId);
    return res.status(201).json();
  } catch (err) {
    console.error(err);

    if (err instanceof z.ZodError) {
      return res.status(400).json(err.formErrors);
    }
    return res.status(500).json({
      message: "Error while creating review",
    });
  }
};

const deletePlaceReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.body;
    if (!reviewId)
      return res.status(400).json({
        message: "Review ID required",
      });

    const user = await UserModel.getDataById(req.jwtUserData!.userId);
    if (!user) return res.status(400).json({ message: "User ID not found" });
    const review = await PlaceReviewModel.getReviewById(reviewId);
    if (!review)
      return res.status(400).json({ message: "Review ID not found" });

    if (
      review.userId === user.id ||
      user.moderationLvl == USER_LEVELS.MODERATOR
    ) {
      await PlaceReviewModel.deleteReview(reviewId);
      return res.status(204).json();
    } else {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this review" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error while deleting review",
    });
  }
};

const getAllReviews = async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;
    const sortBy: ReviewSortBy = (req.query.sortBy as ReviewSortBy) || "newest";
    const filterByStar: ReviewFilterBy =
      (req.query.filterByStar as ReviewFilterBy) || "all";
    req.query.filterBy || "all";
    const page = req.query.page || "1";

    const totalReviews = await PlaceReviewModel.countAllRows(placeId);
    const REVIEWS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);

    const reviews = await PlaceReviewModel.getReviews(
      placeId,
      sortBy,
      filterByStar,
      (parseInt(page as string) - 1) * REVIEWS_PER_PAGE,
      REVIEWS_PER_PAGE
    );
    return res.status(200).json({ reviews, currentPage: page, totalPages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error while getting reviews",
    });
  }
};

export default {
  createPlaceReview,
  deletePlaceReview,
  getAllReviews,
};
