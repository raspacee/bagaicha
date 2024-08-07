import { pool } from "../db/index";
import { v4 as uuidv4 } from "uuid";

const user_has_liked_review = async (user_id: string, review_id: string) => {
  const like = await pool.query(
    "select * from review_like where \
    liker_id=$1 and review_id=$2 limit 1",
    [user_id, review_id]
  );
  return like.rowCount == 1;
};

const create_like = async (user_id: string, review_id: string) => {
  /* Increase the like count */
  await pool.query(
    `update review set like_count = like_count + 1 
  where id=$1;`,
    [review_id]
  );
  await pool.query(
    "insert into review_like (id, liker_id, review_id) values ($1, $2, $3)",
    [uuidv4(), user_id, review_id]
  );
};

const delete_like = async (user_id: string, review_id: string) => {
  await pool.query(
    `update review set like_count = like_count - 1 
  where id=$1;`,
    [review_id]
  );
  await pool.query(
    "delete from review_like where liker_id = $1 and review_id = $2",
    [user_id, review_id]
  );
};

const createPostLike = async (postId: string, userId: string) => {
  const text = `
  INSERT INTO "postLike" ("postId", "likerId")
  VALUES ($1, $2);
`;
  const values = [postId, userId];
  await pool.query(text, values);
};

const deletePostLike = async (postId: string, userId: string) => {
  const text = `
  DELETE FROM "postLike"
  WHERE "postId" = $1
    AND "likerId" = $2;
`;
  const values = [postId, userId];
  await pool.query(text, values);
};

const exporter = {
  user_has_liked_review,
  create_like,
  delete_like,
  createPostLike,
  deletePostLike,
};

export default exporter;
