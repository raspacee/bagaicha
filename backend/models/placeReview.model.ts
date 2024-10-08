import { CreatePlaceReviewForm, FetchedPlaceReview } from "../types";
import { v4 as uuid } from "uuid";
import { pool } from "../db";

const createReview = async (form: CreatePlaceReviewForm) => {
  const text = `
  INSERT INTO "placeReview" (
    id,
    "placeId",
    "userId",
    body,
    rating,
    "imageUrl",
    "helpfulnessCount",
    "createdAt"
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
`;
  const values = [
    uuid(),
    form.placeId,
    form.userId,
    form.body,
    form.rating,
    form.imageUrl || null,
    0,
    form.createdAt,
  ];
  await pool.query(text, values);
};

const deleteReview = async (reviewId: string) => {
  const text = `
  DELETE FROM "placeReview"
  WHERE "id" = $1;
`;
  const values = [reviewId];
  await pool.query(text, values);
};

const getReviews = async (
  placeId: string
): Promise<FetchedPlaceReview[] | null> => {
  const text = `
  SELECT *
  FROM "placeReview"
  WHERE "placeId" = $1;
`;
  const values = [placeId];
  const result = await pool.query(text, values);
  if (!result.rowCount) return null;
  return result.rows;
};

const getReviewById = async (
  id: string
): Promise<FetchedPlaceReview | null> => {
  const text = `
  SELECT *
  FROM "placeReview"
  WHERE id = $1
  LIMIT 1;
`;
  const values = [id];
  const result = await pool.query(text, values);
  if (!result.rowCount) return null;
  return result.rows[0];
};

export default {
  createReview,
  deleteReview,
  getReviews,
  getReviewById,
};
