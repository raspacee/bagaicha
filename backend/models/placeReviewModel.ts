import { pool } from "../db/index";

const create_review = async (
  place_id: string,
  author_id: string,
  textbody: string,
  rating: number,
  created_at: string,
) => {
  const text = `insert into place_review (place_id, author_id, body, rating, created_at)
  values ($1, $2, $3, $4, $5)`;
  const values = [place_id, author_id, textbody, rating, created_at];
  await pool.query(text, values);
};

const get_reviews = async (place_id: string, rating: string) => {
  const text = `
select plr.*, u.profile_picture_url, u.first_name, u.last_name, u.email from place_review as plr
inner join user_ as u on plr.author_id = u.id
where plr.rating = $1 and plr.place_id = $2
order by created_at desc limit 10;
`;
  const values = [rating, place_id];
  const data = await pool.query(text, values);
  if (data.rowCount == 0) return null;
  return data.rows;
};

const exporter = {
  create_review,
  get_reviews,
};

export default exporter;
