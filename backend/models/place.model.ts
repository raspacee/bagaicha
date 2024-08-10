import { pool } from "../db/index";
import { Distances } from "../lib/enums";
import { Place } from "../types";

const getPlacebyId = async (placeId: string): Promise<Place | null> => {
  const result = await pool.query("select * from place where id=$1 limit 1", [
    placeId,
  ]);
  if (result.rowCount == 0) return null;
  return result.rows[0];
};

enum Rating {
  five = "5",
  four = "4",
  three = "3",
  two = "2",
  one = "1",
}

const update_place = async (
  id: string,
  open_days: string[],
  opening_time: string,
  closing_time: string,
  place_features: number[],
  thumbnail_img: string,
  cover_img: string
) => {
  const text = `update place set open_days=$2,
  opening_time=$3, closing_time=$4, place_features=$5,
  thumbnail_img_url=$6, cover_img_url=$7 where id=$1`;
  const values = [
    id,
    open_days,
    opening_time,
    closing_time,
    place_features,
    thumbnail_img == "null" ? null : thumbnail_img,
    cover_img == "null" ? null : cover_img,
  ];
  await pool.query(text, values);
};

const get_review_by_rating = async (uuid: string, rating: string) => {
  const text = `select r.*, u.first_name || ' ' || u.last_name as author_name 
from review as r inner join user_ as u on r.author_id = u.id where r.place_id=$1 and r.rating=$2`;
  const values = [uuid, rating as Rating];
  const reviews = await pool.query(text, values);
  if (reviews.rowCount == 0) return null;
  return reviews.rows;
};

/* create_place is used for creating places that are already in openmaps */
const create_place = async (
  id: string,
  openmaps_place_id: string,
  name: string,
  lat: string,
  long: string,
  display_name: string
) => {
  let text =
    "insert into place (id, openmaps_place_id, name, lat, long, display_name) \
    values ($1, $2, $3, $4, $5, $6)";
  let values = [id, openmaps_place_id, name, lat, long, display_name];
  return pool.query(text, values);
};

/* add_place is used for adding places that are not in openmaps */
const add_place = async (
  id: string,
  name: string,
  lat: string,
  long: string,
  foods: string[],
  display_name: string,
  display_pic_url: string,
  owned_by: string | null,
  alcohol_allowed: boolean,
  openmaps_place_id: string
) => {
  let text =
    "insert into place (id, name, lat, long, display_name, cover_img_url, foods_offered, owned_by, alcohol_allowed, openmaps_place_id) \
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";
  let values = [
    id,
    name,
    lat,
    long,
    display_name,
    display_pic_url,
    foods,
    owned_by,
    alcohol_allowed,
    openmaps_place_id,
  ];
  return pool.query(text, values);
};

const get_top_places = async (
  user_lat: number,
  user_long: number,
  categories: string[] | null,
  suggestions: number[] | null,
  distance: Distances | null
) => {
  const text = `
select *, haversine(place.lat::decimal, place.long::decimal, $1, $2) as distance,
	(select count(*) from review where place_id=place.id) as total_reviews,
	(select avg(rating) from review where place_id=place.id) as avg_rating
  from place
	where ($3::varchar[] is null or (foods_offered && $3::varchar[]))
	and ($4::smallint[] is null or ($4::smallint[] && place_features))
  and
  ($5::integer is null or haversine(lat::decimal, long::decimal, $1, $2) < $5::integer)
	order by distance asc limit 10;
`;
  const values = [user_lat, user_long, categories, suggestions, distance];
  const data = await pool.query(text, values);
  if (data.rowCount == 0) return null;
  return data.rows;
};

const search_place = async (name: string) => {
  const text = `select *, (select avg(rating) from review where place_id=place.id) as avg_rating,
	(select count(*) from review where place_id=place.id) as total_reviews
 from place where name ilike $1;`;
  const data = await pool.query(text, [`%${name}%`]);
  if (data.rowCount == 0) return null;
  return data.rows;
};

const getPlaceSuggestionsByQuery = async (query: string): Promise<Place[]> => {
  const text = `
  SELECT id, name, lat, lon
  FROM place
  WHERE name ILIKE $1
  LIMIT 5;
  `;
  const values = [`%${query}%`];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return [];
  return result.rows;
};

const exporter = {
  getPlacebyId,
  create_place,
  get_review_by_rating,
  get_top_places,
  update_place,
  add_place,
  search_place,
  getPlaceSuggestionsByQuery,
};

export default exporter;
