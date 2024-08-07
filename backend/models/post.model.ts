import { z } from "zod";
import { pool } from "../db/index";
import { Distances } from "../lib/enums";
import { FeedPost, PostWithComments } from "../types";
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

const search_reviews = async (user_id: string, query: string) => {
  const text = ` select r.*, u.first_name, u.last_name, u.profile_picture_url, u.email, pl.lat, pl.long, pl.name, pl.openmaps_place_id,
(select exists (select * from review_like as l where l.liker_id=$1 and l.review_id=r.id limit 1)) as user_has_liked,
(select exists (select * from review_bookmark as b where b.user_id=$1 and b.review_id=r.id limit 1)) as user_has_bookmarked_review
from review as r inner join user_ as u on r.author_id = u.id
	inner join place as pl on r.place_id = pl.id 
	 where r.body ilike $2 or r.foods_ate @> $3 
  order by created_at desc limit 20;`;
  const values = [user_id, `%${query}%`, Array.from(query)];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return null;
  return result.rows;
};

const get_reviews_by_email = async (user_id: string, email: string) => {
  const text = `
 select r.*, u.first_name, u.last_name, u.profile_picture_url, u.email, pl.lat, pl.long, pl.name, pl.openmaps_place_id,
(select exists (select * from review_like as l where l.liker_id=$1 and l.review_id=r.id limit 1)) as user_has_liked,
(select exists (select * from review_bookmark as b where b.user_id=$1 and b.review_id=r.id limit 1)) as user_has_bookmarked_review
from review as r inner join user_ as u on r.author_id = u.id
	inner join place as pl on r.place_id = pl.id 
where u.email = $2
  order by created_at desc limit 20;
`;
  const values = [user_id, email];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return null;
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

const exporter = {
  createPost,
  getFeedPosts,
  search_reviews,
  get_reviews_by_email,
  getPostById,
};

export default exporter;
