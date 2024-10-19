import { pool } from "../db/index";
import {
  AddPlaceForm,
  CreatePlaceResponse,
  Distance,
  EditPlaceForm,
  FoodsOffered,
  Place,
  PlaceFeature,
  PlaceWithRating,
  SearchResultTotalCount,
  UserLocation,
} from "../types";
import { v4 as uuid } from "uuid";

const getPlacebyId = async (
  placeId: string
): Promise<PlaceWithRating | null> => {
  const text = `
  WITH "placeRating" AS (
    SELECT 
        COUNT(*) AS "totalReviews", 
        AVG(rating) AS "rating"
    FROM "placeReview" 
    WHERE "placeId" = $1
  )
  SELECT 
      p.*, 
      pr."totalReviews", 
      pr."rating"
  FROM "place" AS p
  LEFT JOIN "placeRating" AS pr ON true
  WHERE p.id = $1
  LIMIT 1;
  `;
  const result = await pool.query(text, [placeId]);
  if (result.rowCount == 0) return null;
  return result.rows[0];
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
  SELECT id, name, lat, lon, road, neighbourhood, city
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
    "placeFeatures" = $2,
    "foodsOffered" = $3,
    "coverImgUrl" = $4,
    "websiteLink" = $5,
    "instagramLink" = $6,
    "contactNumbers" = $7
  WHERE "id" = $8;
  `;
  const values = [
    data.name,
    JSON.parse(data.placeFeatures as any),
    JSON.parse(data.foodsOffered as any),
    data.coverImgUrl,
    JSON.parse(data.websiteLink as any),
    JSON.parse(data.instagramLink as any),
    JSON.parse(data.contactNumbers as any),
    placeId,
  ];
  await pool.query(text, values);
};

const getTopPlaces = async (
  selectedFoods: FoodsOffered[] | null,
  selectedFeatures: PlaceFeature[] | null,
  selectedDistance: Distance,
  userCoordinates: UserLocation
): Promise<PlaceWithRating[]> => {
  const text = `
  WITH "placeRating" AS (
    SELECT 
        "placeId",
        COUNT(*) AS "totalReviews", 
        AVG(rating) AS "rating"
    FROM "placeReview" 
    GROUP BY "placeId"
  ),
  "PlaceDistance" AS (
  SELECT 
    id,
    haversine(place.lat::double precision, place.lon::double precision, $3::double precision, $4::double precision) AS distance
  FROM place
  WHERE 
    ($1::text[] IS NULL OR ($1::text[] && "foodsOffered"))
    AND 
    ($2::text[] IS NULL OR ($2::text[] && "placeFeatures"))
  )
  SELECT place.*, pd.distance, pr.*
  FROM "place"
  INNER JOIN "PlaceDistance" AS pd ON place.id = pd.id
  LEFT JOIN "placeRating" AS pr ON place.id = pr."placeId"
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

const createMyPlace = async (
  data: AddPlaceForm,
  imageUrl: string
): Promise<CreatePlaceResponse> => {
  const id = uuid();
  const date = new Date().toISOString();
  const text = `
  INSERT INTO "place" (
  "id", "osmId", "name", "lat", "lon", "placeFeatures", "coverImgUrl",
  "foodsOffered", "ownedBy", "createdAt"
  ) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  RETURNING "id";`;

  const values = [
    id,
    "Custom",
    data.name,
    parseFloat(data.lat),
    parseFloat(data.lon),
    JSON.parse(data.placeFeatures as any),
    imageUrl,
    JSON.parse(data.foodsOffered as any),
    JSON.parse(data.ownedBy as any),
    date,
  ];
  const result = await pool.query(text, values);
  return {
    id: result.rows[0].id,
  };
};

const getPlacesOfUser = async (userId: string): Promise<Place[]> => {
  const text = `
  SELECT "id", "name", "coverImgUrl", "createdAt"
  FROM "place"
  WHERE "ownedBy" = $1
  `;
  const values = [userId];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return [];
  return result.rows;
};

const exporter = {
  getPlacebyId,
  searchPlace,
  getPlaceSuggestionsByQuery,
  updatePlaceById,
  getTopPlaces,
  getTotalSearchResults,
  createMyPlace,
  getPlacesOfUser,
};

export default exporter;
