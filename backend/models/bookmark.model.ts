import { pool } from "../db/index";
import { v4 as uuid } from "uuid";
import { FeedPost } from "../types";

const user_has_bookmarked_review = async (
  user_id: string,
  review_id: string
) => {
  const bookmark = await pool.query(
    "select * from review_bookmark where \
    user_id=$1 and review_id=$2 limit 1",
    [user_id, review_id]
  );
  return bookmark.rowCount == 1;
};

const createPostBookmark = async (postId: string, userId: string) => {
  const id = uuid();
  const text = `
  INSERT INTO "postBookmark" (
    "id", 
    "userId", 
    "postId", 
    "createdAt"
  )
  VALUES (
    $1, 
    $2, 
    $3, 
    $4
  );`;

  const values = [id, userId, postId, new Date().toISOString()];
  await pool.query(text, values);
};

const deletePostBookmark = async (postId: string, userId: string) => {
  const text = `
  DELETE FROM "postBookmark"
  WHERE "userId" = $1
    AND "postId" = $2;`;
  const values = [userId, postId];
  await pool.query(text, values);
};

const getBoomarksOfUser = async (userId: string): Promise<FeedPost[]> => {
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
    true AS "hasBookmarked" 
  FROM "postBookmark" AS b
  INNER JOIN "post" AS p ON p."id" = b."postId"
  INNER JOIN "user_" AS u ON u."id" = p."authorId"
  INNER JOIN "place" AS pl ON pl."id" = p."placeId"
  WHERE b."userId" = $1
  ORDER BY b."createdAt" DESC;
`;
  const values = [userId];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return [];
  return result.rows;
};

const exporter = {
  user_has_bookmarked_review,
  createPostBookmark,
  deletePostBookmark,
  getBoomarksOfUser,
};

export default exporter;
