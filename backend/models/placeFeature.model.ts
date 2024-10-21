import { pool } from "../db";
import { FetchedFeature } from "../types";

const getFeatures = async (
  placeId: string
): Promise<FetchedFeature[] | null> => {
  const text = `
    SELECT f.id, f."featureName"
    FROM "placeFeature" AS pl
    INNER JOIN "feature" AS f ON pl."featureId" = f.id
    WHERE pl."placeId" = $1`;
  const values = [placeId];
  const results = await pool.query(text, values);
  if (results.rowCount == 0) return null;
  return results.rows;
};

const createFeatureToPlace = async (placeId: string, featureId: number) => {
  const text = `
    INSERT INTO "placeFeature" ("placeId", "featureId") 
    VALUES ($1, $2)`;
  const values = [placeId, featureId];
  await pool.query(text, values);
};

const deleteFeatureFromPlace = async (placeId: string, featureId: number) => {
  const text = `
  DELETE FROM "placeFeature"
  WHERE "placeId" = $1 AND
  "featureId" = $2`;
  const values = [placeId, featureId];
  await pool.query(text, values);
};

const getAllDatabaseFeatures = async (): Promise<FetchedFeature[]> => {
  const text = `
  SELECT * FROM "feature"`;
  const results = await pool.query(text);
  return results.rows;
};

export default {
  getFeatures,
  createFeatureToPlace,
  deleteFeatureFromPlace,
  getAllDatabaseFeatures,
};
