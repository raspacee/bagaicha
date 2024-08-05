import { pool } from "../db";
import { Comment } from "../types";

const get_comments = async (review_id: string, user_id: string) => {
  const text = `
select rc.*, u.first_name || ' ' || u.last_name as author_name, u.email as author_email, 
u.profile_picture_url as author_picture_url,
(select exists(select * from review_comment where reply_to = rc.id)) as has_replies,
(select exists(select * from comment_like where liker_id = $2 and comment_id = rc.id)) as user_has_liked
	from review_comment as rc
	inner join user_ as u on rc.author_id = u.id
	inner join review as r on rc.review_id = r.id
	where rc.reply_to is null and rc.review_id = $1
	order by rc.created_at desc
`;
  const values = [review_id, user_id];
  const data = await pool.query(text, values);
  console.log(data.rows);
  if (data.rowCount == 0) return null;
  return data.rows;
};

const create_comment = async (
  review_id: string,
  author_id: string,
  comment_body: string,
  reply_to: number | null
) => {
  const text = `
with inserted as (
insert into review_comment (review_id, author_id, body, created_at, reply_to)
	values ($1, $2, $3, $4, $5)
returning *)

select io.*, u.first_name || ' ' || u.last_name as author_name,
u.email as author_email, u.profile_picture_url as author_picture_url
from inserted as io
inner join user_ as u on u.id = io.author_id 
`;
  const values = [
    review_id,
    author_id,
    comment_body,
    new Date().toISOString(),
    reply_to,
  ];
  const data = await pool.query(text, values);
  return data.rows;
};

const get_replies = async (comment_id: number, user_id: string) => {
  const text = `
select rc.*, u.first_name || ' ' || u.last_name as author_name, u.profile_picture_url as author_picture_url,
u.profile_picture_url as author_picture_url,
(select exists(select * from comment_like where liker_id = $2 and comment_id = rc.id)) as user_has_liked
	from review_comment as rc
	inner join user_ as u on rc.author_id = u.id
	inner join review as r on rc.review_id = r.id
	where rc.reply_to = $1
	order by rc.created_at desc`;
  const values = [comment_id, user_id];
  const data = await pool.query(text, values);
  return data.rowCount == 0 ? null : data.rows;
};

const user_has_liked_comment = async (user_id: string, comment_id: number) => {
  const text = `select * from comment_like where liker_id = $1 and comment_id = $2 limit 1`;
  const values = [user_id, comment_id];
  const data = await pool.query(text, values);
  if (data.rowCount == 0) return false;
  return true;
};

const getCommentsOfPost = async (
  postId: string,
  userId: string | null
): Promise<Comment[]> => {
  const text = `
SELECT 
  rc.body, 
  rc.author_id, 
  rc.review_id,
  rc.id, 
  rc.like_count, 
  u.first_name || ' ' || u.last_name AS author_name, 
  u.email AS author_email, 
  u.profile_picture_url AS author_picture_url,
  (
    SELECT EXISTS (
      SELECT 1 
      FROM comment_like 
      WHERE liker_id = $2 
        AND comment_id = rc.id
    )
  ) AS has_liked_comment
FROM 
  review_comment AS rc
  INNER JOIN user_ AS u ON rc.author_id = u.id
  INNER JOIN review AS r ON rc.review_id = r.id
WHERE 
  rc.reply_to IS NULL 
  AND rc.review_id = $1
ORDER BY 
  rc.created_at DESC;
`;
  const values = [postId, userId];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return [];
  return result.rows;
};

const exporter = {
  get_comments,
  create_comment,
  get_replies,
  user_has_liked_comment,
  getCommentsOfPost,
};

export default exporter;
