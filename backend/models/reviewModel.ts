import { pool } from "../db/index";
import { Distances } from "../lib/enums";

const create_review = async (
  id: string,
  author_id: string,
  comment: string,
  rating: number,
  picture_url: string,
  place_id: string,
  foods_ate: string[],
  created_at: string
) => {
  let text =
    "with inserted_review as (insert into review (id, author_id, body, rating, picture, place_id, \
        foods_ate, created_at) values ($1, $2, $3, $4, $5, $6, $7, $8) returning *) \
      select inserted_review.*, u.first_name, u.last_name, u.profile_picture_url, u.email, \
      false as user_has_liked, false as user_has_bookmarked_review, pl.* \
      from inserted_review \
      inner join user_ as u on inserted_review.author_id = u.id \
      inner join place as pl on inserted_review.place_id = pl.id";
  let values = [
    id,
    author_id,
    comment,
    rating.toString(),
    picture_url,
    place_id,
    foods_ate,
    created_at,
  ];
  return pool.query(text, values);
};

const get_feed = async (user_id: string) => {
  let text = `
 select r.*, u.first_name, u.last_name, u.profile_picture_url, u.email, pl.lat, pl.long, pl.name, pl.openmaps_place_id,
(select exists (select * from review_like as l where l.liker_id=$1 and l.review_id=r.id limit 1)) as user_has_liked,
(select exists (select * from review_bookmark as b where b.user_id=$1 and b.review_id=r.id limit 1)) as user_has_bookmarked_review
from review as r inner join user_ as u on r.author_id = u.id
	inner join place as pl on r.place_id = pl.id 
  order by created_at desc limit 20;
`;
  const values = [user_id];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return null;
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

const exporter = {
  create_review,
  get_feed,
  search_reviews,
  get_reviews_by_email,
};

export default exporter;
