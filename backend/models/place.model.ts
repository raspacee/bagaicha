import { pool } from "../db/index";
import {
  AddPlaceForm,
  CreatePlaceResponse,
  EditPlaceForm,
  FindPlaceSearchState,
  Place,
  PlaceWithListingInfo,
  PlaceWithRating,
  SearchResultTotalCount,
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
    "coverImgUrl" = $2,
    "websiteLink" = $3,
    "instagramLink" = $4,
    "contactNumbers" = $5
  WHERE "id" = $6;
  `;
  const values = [
    data.name,
    data.coverImgUrl,
    JSON.parse(data.websiteLink as any),
    JSON.parse(data.instagramLink as any),
    JSON.parse(data.contactNumbers as any),
    placeId,
  ];
  await pool.query(text, values);
};

const getTopPlaces = async (
  searchState: FindPlaceSearchState,
  offset: number = 0
): Promise<PlaceWithListingInfo[]> => {
  const text = `
  WITH "distance" AS (
    SELECT "id" AS "placeId",
        CASE
            WHEN null IS null THEN null
            ELSE round((ST_DistanceSphere(ST_MakePoint(lon, lat), ST_MakePoint($3::numeric, $4::numeric)) / 100)::numeric, 2)
        END AS "distanceFromUser"
    FROM place
  )

  SELECT 
      p.*, 
      f."foodsArray", 
      pf."featuresArray", 
      d."distanceFromUser", 
      pr."averageRating" AS rating
  FROM 
      "place" AS p
  LEFT JOIN 
      "foodsView" AS f ON p.id = f."placeId"
  LEFT JOIN 
      "featuresView" AS pf ON p.id = pf."placeId"
  LEFT JOIN 
      "distance" AS d ON p.id = d."placeId"
  INNER JOIN 
      "placeRatingView" AS pr ON p.id = pr."placeId"
  WHERE 
      (($1::varchar[] IS NULL) OR ($1::varchar[] && f."foodsArray"::varchar[]))
      AND (($2::varchar[] IS NULL) OR ($2::varchar[] && pf."featuresArray"::varchar[]))
      AND (($5::integer IS NULL OR $3::numeric IS NULL OR $4::numeric IS NULL) OR (d."distanceFromUser" < $5::integer))
  ORDER BY 
      "averageRating" DESC
  LIMIT 15 OFFSET $6;
`;
  console.log(searchState);
  const values = [
    searchState.selectedFoods,
    searchState.selectedFeatures?.map((feature) => feature.featureName) || null,
    searchState.userLocation?.lon,
    searchState.userLocation?.lat,
    searchState.selectedDistance,
    offset,
  ];
  const result = await pool.query(text, values);
  return result.rows;
};

const getTotalTopPlacesResults = async (
  searchState: FindPlaceSearchState
): Promise<number> => {
  const text = `
  WITH "distance" AS (
    SELECT "id" AS "placeId",
        CASE
            WHEN null IS null THEN null
            ELSE round((ST_DistanceSphere(ST_MakePoint(lon, lat), ST_MakePoint($3::numeric, $4::numeric)) / 100)::numeric, 2)
        END AS "distanceFromUser"
    FROM place
  )

  SELECT COUNT(*)
  FROM "place" AS p
  LEFT JOIN "foodsView" AS f ON p.id = f."placeId"
  LEFT JOIN "featuresView" AS pf ON p.id = pf."placeId"
  LEFT JOIN "distance" AS d ON p.id = d."placeId"
  INNER JOIN "placeRatingView" AS pr ON p.id = pr."placeId"
  WHERE 
      (($1::text[] IS NULL) OR ($1::text[] && f."foodsArray"::text[]))
      AND (($2::varchar[] IS NULL) OR ($2::varchar[] && pf."featuresArray"::varchar[]))
      AND (
          ($5::integer IS NULL OR $3::numeric IS NULL OR $4::numeric IS NULL)
          OR (d."distanceFromUser" < $5::integer)
      )`;
  const values = [
    searchState.selectedFoods,
    searchState.selectedFeatures?.map((feature) => feature.featureName) || null,
    searchState.userLocation?.lon,
    searchState.userLocation?.lat,
    searchState.selectedDistance,
  ];
  const result = await pool.query(text, values);
  return result.rows[0].count;
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
  data: AddPlaceForm
): Promise<CreatePlaceResponse> => {
  const id = uuid();
  const date = new Date().toISOString();
  const text = `
  INSERT INTO "place" (
  "id", "osmId", "name", "lat", "lon",
  "road", "neighbourhood", "city", "state",
  "ownedBy", "createdAt", "websiteLink",
  "instagramLink"
  ) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  RETURNING "id";`;

  const values = [
    id,
    "Custom",
    data.name,
    parseFloat(data.lat as any),
    parseFloat(data.lon as any),
    data.road,
    data.neighbourhood,
    data.city,
    data.state,
    data.ownedBy != "undefined" && data.ownedBy
      ? JSON.parse(data.ownedBy)
      : null,
    date,
    data.websiteLink || null,
    data.instagramLink || null,
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
  getTotalTopPlacesResults,
  getTotalSearchResults,
  createMyPlace,
  getPlacesOfUser,
};

export default exporter;
