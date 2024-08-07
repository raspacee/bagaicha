import { pool } from "../db";
import { CommentForm, CommentWhole } from "../types";
import { v4 as uuid } from "uuid";

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

const createCommentOnPost = async (
  commentForm: CommentForm,
  authorId: string
) => {
  const text = `
INSERT INTO "comment" ("postId", "authorId", "body", "createdAt", "id")
  VALUES ($1, $2, $3, $4, $5)
`;
  const values = [
    commentForm.postId,
    authorId,
    commentForm.body,
    new Date().toISOString(),
    uuid(),
  ];
  await pool.query(text, values);
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
): Promise<CommentWhole[]> => {
  const text = `
SELECT 
  c.*,
  u."firstName" AS "authorFirstName",
  u."lastName" AS "authorLastName", 
  u.email AS "authorEmail", 
  u."profilePictureUrl" AS "authorPictureUrl",
  (
    SELECT EXISTS (
      SELECT 1 
      FROM "commentLike"
      WHERE "likerId" = $2 
        AND "commentId" = c.id
    )
  ) AS "hasLiked"
FROM 
  "comment" AS c
  INNER JOIN "user_" AS u ON c."authorId" = u.id
  INNER JOIN "post" AS p ON c."postId" = p.id
WHERE 
  c."postId" = $1
ORDER BY 
  c."createdAt" DESC;
`;
  const values = [postId, userId];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return [];
  return result.rows;
};

const exporter = {
  get_comments,
  createCommentOnPost,
  get_replies,
  user_has_liked_comment,
  getCommentsOfPost,
};

export default exporter;
