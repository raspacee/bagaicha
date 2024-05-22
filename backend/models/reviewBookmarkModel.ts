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

select b.id as bookmark_id, u.first_name || ' ' || u.last_name as author_name, u.email as author_email,
(select exists (select * from review_like as l where l.liker_id=$1 and l.review_id=b.review_id limit 1)) as has_liked,
u.profile_picture_url, r.id as review_id, r.body, 
	r.picture, r.rating, r.created_at from review_bookmark as b
	inner join review as r on b.review_id = r.id
	inner join user_ as u on r.author_id = u.id
	where b.user_id=$1 order by b.created_at desc;
`;
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
