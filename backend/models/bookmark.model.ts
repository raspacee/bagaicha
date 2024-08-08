import { pool } from "../db/index";
import { v4 as uuid } from "uuid";

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

const get_bookmarks = async (user_id: string) => {
  const text = `
 select r.*, u.first_name, u.last_name, u.profile_picture_url, u.email, pl.lat, pl.long, pl.name, pl.openmaps_place_id,
(select exists (select * from review_like as l where l.liker_id=$1 and l.review_id=r.id limit 1)) as user_has_liked,
(select exists (select * from review_bookmark as b where b.user_id=$1 and b.review_id=r.id limit 1)) as user_has_bookmarked_review
from review_bookmark as b inner join user_ as u on b.user_id = u.id
inner join review as r on r.id = b.review_id
	inner join place as pl on r.place_id = pl.id 
where b.user_id = $1
  order by b.created_at desc;`;
  const values = [user_id];
  const res = await pool.query(text, values);
  if (res.rowCount == 0) return null;
  return res.rows;
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

const exporter = {
  get_bookmarks,
  user_has_bookmarked_review,
  createPostBookmark,
  deletePostBookmark,
};

export default exporter;
