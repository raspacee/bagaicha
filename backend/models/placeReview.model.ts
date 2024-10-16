import {
  CreatePlaceReviewForm,
  FetchedPlaceReviewWithAuthor,
  ReviewFilterBy,
  ReviewSortBy,
} from "../types";
import { v4 as uuid } from "uuid";
import { pool } from "../db";

const createReview = async (form: CreatePlaceReviewForm, userId: string) => {
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
    userId,
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
  placeId: string,
  sortBy: ReviewSortBy,
  filterByStar: ReviewFilterBy,
  offset: number,
  limit: number
): Promise<FetchedPlaceReviewWithAuthor[] | null> => {
  const text = `
  SELECT 
    r.*, 
    json_build_object(
        'id', u.id,
        'firstName', u."firstName",
        'lastName', u."lastName",
        'email', u.email,
        'createdAt', u."createdAt",
        'profilePictureUrl', u."profilePictureUrl",
        'moderationLvl', u."moderationLvl",
        'bio', u.bio
    ) AS author 
  FROM 
      "placeReview" AS r
  INNER JOIN 
      "user_" AS u ON r."userId" = u.id
  WHERE 
      r."placeId" = $1
      ${filterByStar == "all" ? "" : "AND r.rating = $4"}
  ORDER BY r."createdAt" ${sortBy == "newest" ? "DESC" : "ASC"}
  LIMIT $2
  OFFSET $3
`;
  const values = [placeId, limit, offset];
  if (filterByStar != "all") values.push(filterByStar);
  const result = await pool.query(text, values);
  if (!result.rowCount) return null;
  return result.rows;
};

const getReviewById = async (
  id: string
): Promise<FetchedPlaceReviewWithAuthor | null> => {
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

const countAllRows = async (placeId: string): Promise<number> => {
  const text = `SELECT count(*) FROM "placeReview" WHERE "placeId" = $1;`;
  const values = [placeId];
  const result = await pool.query(text, values);
  return result.rows[0].count;
};

export default {
  createReview,
  deleteReview,
  getReviews,
  getReviewById,
  countAllRows,
};
