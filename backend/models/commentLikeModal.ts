import { pool } from "../db/index";

const create_like = async (user_id: string, comment_id: string) => {
  /* Increase the like count */
  await pool.query(
    `update review_comment set like_count = like_count + 1 
  where id=$1;`,
    [comment_id],
  );
  await pool.query(
    "insert into comment_like (liker_id, comment_id) values ($1, $2)",
    [user_id, comment_id],
  );
};

const delete_like = async (user_id: string, comment_id: string) => {
  await pool.query(
    `update review_comment set like_count = like_count - 1 
  where id=$1;`,
    [comment_id],
  );
  await pool.query(
    "delete from comment_like where liker_id = $1 and comment_id = $2",
    [user_id, comment_id],
  );
};

const exporter = {
  create_like,
  delete_like,
};

export default exporter;
