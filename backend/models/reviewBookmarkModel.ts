import { pool } from "../db/index";

const create_bookmark = async (
  user_id: string,
  review_id: string,
  created_at: string,
) => {
  const text = `insert into review_bookmark (user_id, review_id, created_at) values ($1, $2, $3)`;
  const values = [user_id, review_id, created_at];
  return await pool.query(text, values);
};

const delete_bookmark = async (user_id: string, review_id: string) => {
  await pool.query(
    "delete from review_bookmark where user_id = $1 and review_id = $2",
    [user_id, review_id],
  );
};

const user_has_bookmarked_review = async (
  user_id: string,
  review_id: string,
) => {
  const bookmark = await pool.query(
    "select * from review_bookmark where \
    user_id=$1 and review_id=$2 limit 1",
    [user_id, review_id],
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

const exporter = {
  create_bookmark,
  get_bookmarks,
  delete_bookmark,
  user_has_bookmarked_review,
};

export default exporter;
