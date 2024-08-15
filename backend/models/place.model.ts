import { pool } from "../db/index";
import { Distances } from "../lib/enums";
import {
  Distance,
  EditPlaceForm,
  FoodsOffered,
  Place,
  PlaceFeature,
  SearchResultTotalCount,
  UserLocation,
} from "../types";

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

const searchPlace = async (name: string, offset: number): Promise<Place[]> => {
  const text = `
  SELECT *
  FROM place
  WHERE name ILIKE $1
  LIMIT 10
  OFFSET $2;
  `;
  const result = await pool.query(text, [`%${name}%`, offset]);
  if (result.rowCount == 0) return [];
  return result.rows;
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

const updatePlaceById = async (data: EditPlaceForm, placeId: string) => {
  const text = `
  UPDATE place
  SET 
    "name" = $1,
    "openDays" = $2,
    "placeFeatures" = $3,
    "foodsOffered" = $4,
    "coverImgUrl" = $5,
    "openingTime" = $6,
    "closingTime" = $7
  WHERE "id" = $8;
  `;
  const values = [
    data.name,
    JSON.parse(data.openDays as any),
    JSON.parse(data.placeFeatures as any),
    JSON.parse(data.foodsOffered as any),
    data.coverImgUrl,
    JSON.parse(data.openingTime as any),
    JSON.parse(data.closingTime as any),
    placeId,
  ];
  await pool.query(text, values);
};

const getTopPlaces = async (
  selectedFoods: FoodsOffered[] | null,
  selectedFeatures: PlaceFeature[] | null,
  selectedDistance: Distance,
  userCoordinates: UserLocation
): Promise<Place[]> => {
  const text = `
  WITH "PlaceDistance" AS (
  SELECT 
    id,
    haversine(place.lat::double precision, place.lon::double precision, $3::double precision, $4::double precision) AS distance
  FROM place
  WHERE 
    ($1::text[] IS NULL OR ($1::text[] && "foodsOffered"))
    AND 
    ($2::text[] IS NULL OR ($2::text[] && "placeFeatures"))
  )
  SELECT place.*, pd.distance
  FROM "place"
  INNER JOIN "PlaceDistance" AS pd ON place.id = pd.id
  WHERE
    ($5::double precision IS NULL OR distance < $5::double precision)
  ORDER BY distance ASC
  LIMIT 10;
`;
  const values = [
    selectedFoods,
    selectedFeatures,
    userCoordinates.lat,
    userCoordinates.lon,
    selectedDistance,
  ];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return [];
  return result.rows;
};

const getTotalSearchResults = async (
  query: string
): Promise<SearchResultTotalCount> => {
  const result = await pool.query(
    `
    select count(*)
    from place
    where name ilike $1;
    `,
    [`%${query}%`]
  );
  if (result.rowCount == 0) {
    return {
      count: 0,
    } as SearchResultTotalCount;
  }
  return result.rows[0];
};

const exporter = {
  getPlacebyId,
  create_place,
  get_review_by_rating,
  add_place,
  searchPlace,
  getPlaceSuggestionsByQuery,
  updatePlaceById,
  getTopPlaces,
  getTotalSearchResults,
};

export default exporter;
