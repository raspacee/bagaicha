import { pool } from "../db/index";
import { Distances } from "../lib/enums";
import {
  EditPostForm,
  FeedPost,
  PostWithComments,
  SearchResultTotalCount,
} from "../types";
import { v4 as uuidv4 } from "uuid";

const createPost = async (
  authorId: string,
  body: string,
  rating: number,
  imageUrl: string,
  placeId: string
): Promise<FeedPost> => {
  const text = `
  WITH insertedPost AS (
    INSERT INTO "post" (
      "id",
      "authorId",
      "body",
      "rating",
      "imageUrl",
      "placeId",
      "createdAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  )
  SELECT
    insertedPost.*,
    u."firstName" as "authorFirstname",
    u."lastName" as "authorLastname",
    u."profilePictureUrl" as "authorPictureUrl",
    u."email" as "authorEmail",
    false AS "hasLiked",
    false AS "hasBookmarked",
    pl.name as "placeName",
    pl.lat,
    pl.lon
  FROM insertedPost
  INNER JOIN "user_" AS u ON insertedPost."authorId" = u."id"
  INNER JOIN "place" AS pl ON insertedPost."placeId" = pl."id";
`;
  const newPostId = uuidv4();
  const createdAt = new Date().toISOString();
  let values = [
    newPostId,
    authorId,
    body,
    rating.toString(),
    imageUrl,
    placeId,
    createdAt,
  ];
  const result = await pool.query(text, values);
  return result.rows[0];
};

const getFeedPosts = async (userId: string): Promise<FeedPost[]> => {
  const text = `
  SELECT 
    p.*,
    u."firstName" AS "authorFirstName",
    u."lastName" AS "authorLastName", 
    u."profilePictureUrl" AS "authorPictureUrl", 
    u."email" AS "authorEmail", 
    pl."lat", 
    pl."lon", 
    pl."name" AS "placeName", 
    (
      SELECT EXISTS (
        SELECT 1 
        FROM "postLike" AS l 
        WHERE l."likerId" = $1 
          AND l."postId" = p."id" 
        LIMIT 1
      )
    ) AS "hasLiked",
    (
      SELECT EXISTS (
        SELECT 1 
        FROM "postBookmark" AS b 
        WHERE b."userId" = $1 
          AND b."postId" = p."id" 
        LIMIT 1
      )
    ) AS "hasBookmarked"
  FROM 
    "post" AS p
    INNER JOIN "user_" AS u ON p."authorId" = u."id"
    INNER JOIN "place" AS pl ON p."placeId" = pl."id" 
  ORDER BY p."createdAt" DESC 
  LIMIT 20;
`;

  const values = [userId];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return [];
  return result.rows;
};

const searchPosts = async (
  userId: string,
  query: string,
  offset: number
): Promise<FeedPost[]> => {
  const text = `
  SELECT 
    p.*,
    u."firstName" AS "authorFirstName",
    u."lastName" AS "authorLastName", 
    u."profilePictureUrl" AS "authorPictureUrl", 
    u."email" AS "authorEmail", 
    pl."lat", 
    pl."lon", 
    pl."name" AS "placeName", 
    (
      SELECT EXISTS (
        SELECT 1 
        FROM "postLike" AS l 
        WHERE l."likerId" = $1 
          AND l."postId" = p."id" 
        LIMIT 1
      )
    ) AS "hasLiked",
    (
      SELECT EXISTS (
        SELECT 1 
        FROM "postBookmark" AS b 
        WHERE b."userId" = $1 
          AND b."postId" = p."id" 
        LIMIT 1
      )
    ) AS "hasBookmarked"
  FROM 
    "post" AS p
    INNER JOIN "user_" AS u ON p."authorId" = u."id"
    INNER JOIN "place" AS pl ON p."placeId" = pl."id" 
  WHERE
    p."body" ILIKE $2
  LIMIT 10
  OFFSET $3;
  `;
  const values = [userId, `%${query}%`, offset];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return [];
  return result.rows;
};

const getUserPosts = async (
  userId: string,
  requestingUserId: string
): Promise<FeedPost[]> => {
  const text = `
  SELECT 
    p.*, 
    u."firstName" AS "authorFirstName",
    u."lastName" AS "authorLastName", 
    u."profilePictureUrl" AS "authorPictureUrl", 
    u."email" AS "authorEmail", 
    pl."lat", 
    pl."lon", 
    pl."name" AS "placeName", 
    (
      SELECT EXISTS (
        SELECT 1 
        FROM "postLike" AS l 
        WHERE l."likerId" = $2 
          AND l."postId" = p."id" 
        LIMIT 1
      )
    ) AS "hasLiked",
    (
      SELECT EXISTS (
        SELECT 1 
        FROM "postBookmark" AS b 
        WHERE b."userId" = $2 
          AND b."postId" = p."id" 
        LIMIT 1
      )
    ) AS "hasBookmarked"
  FROM 
    "post" AS p
    INNER JOIN "user_" AS u ON p."authorId" = u."id"
    INNER JOIN "place" AS pl ON p."placeId" = pl."id" 
  WHERE u.id = $1
  ORDER BY p."createdAt" DESC 
  LIMIT 20;
`;
  const values = [userId, requestingUserId];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return [];
  return result.rows;
};

const getPostById = async (
  postId: string,
  userId: string | null
): Promise<PostWithComments | null> => {
  const text = `
    SELECT 
    p.*, 
    u."firstName" AS "authorFirstName",
    u."lastName" AS "authorLastName", 
    u."profilePictureUrl" AS "authorPictureUrl", 
    u."email" AS "authorEmail", 
    pl."lat", 
    pl."lon", 
    pl."name" AS "placeName", 
    (
      SELECT EXISTS (
        SELECT 1 
        FROM "postLike" AS l 
        WHERE l."likerId" = $1 
          AND l."postId" = p."id" 
        LIMIT 1
      )
    ) AS "hasLiked",
    (
      SELECT EXISTS (
        SELECT 1 
        FROM "postBookmark" AS b 
        WHERE b."userId" = $1 
          AND b."postId" = p."id" 
        LIMIT 1
      )
    ) AS "hasBookmarked"
  FROM 
    "post" AS p
    INNER JOIN "user_" AS u ON p."authorId" = u."id"
    INNER JOIN "place" AS pl ON p."placeId" = pl."id" 
  WHERE
   p.id = $2;
  `;
  const values = [userId, postId];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return null;
  return result.rows[0];
};

const getTotalSearchResults = async (
  query: string
): Promise<SearchResultTotalCount> => {
  const result = await pool.query(
    `
    select count(*)
    from post 
    where body ilike $1;
    `,
    [`%${query}%`]
  );
  if (result.rowCount == 0) {
    return {
      count: 0,
    } as SearchResultTotalCount;
  }
  return result.rows[0];
};

const updatePostById = async (form: EditPostForm, postId: string) => {
  const text = `
  UPDATE "post" 
    SET "body" = $1, "rating" = $2 
  WHERE "id" = $3`;
  const values = [form.body, form.rating, postId];
  await pool.query(text, values);
};

const deletePostById = async (postId: string) => {
  const text = `
  DELETE FROM "post"
  WHERE "id" = $1;`;
  const values = [postId];
  await pool.query(text, values);
};

const exporter = {
  createPost,
  getFeedPosts,
  searchPosts,
  getPostById,
  getUserPosts,
  getTotalSearchResults,
  updatePostById,
  deletePostById,
};

export default exporter;
