import { pool } from "../db";
import { CreateFoodForm, FetchedFood } from "../types";

const createFood = async (
  placeId: string,
  food: CreateFoodForm
): Promise<FetchedFood> => {
  const text = `
  INSERT INTO "placeFood" (name, category, cuisine, price, "placeId")
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
    `;
  const values = [food.name, food.category, food.cuisine, food.price, placeId];
  const result = await pool.query<FetchedFood>(text, values);
  return result.rows[0];
};

const fetchFoodsByPlaceId = async (placeId: string): Promise<FetchedFood[]> => {
  const text = `
    SELECT * FROM "placeFood"
    WHERE "placeId" = $1
    ORDER BY id DESC;`;
  const values = [placeId];
  const result = await pool.query<FetchedFood>(text, values);
  return result.rows;
};

const deleteFoodById = async (placeId: string, foodId: number) => {
  const text = `
    DELETE FROM "placeFood"
    WHERE "placeId" = $1 AND
    id = $2;`;
  const values = [placeId, foodId];
  await pool.query(text, values);
};

const updateFoodById = async (
  placeId: string,
  food: FetchedFood
): Promise<FetchedFood> => {
  const text = `
    UPDATE "placeFood"
    SET name = $1, cuisine = $2, category = $3, price = $4
    WHERE "placeId" = $5 AND id = $6
    RETURNING *`;
  const values = [
    food.name,
    food.cuisine,
    food.category,
    food.price,
    placeId,
    food.id,
  ];
  const result = await pool.query<FetchedFood>(text, values);
  return result.rows[0];
};

export default {
  createFood,
  fetchFoodsByPlaceId,
  deleteFoodById,
  updateFoodById,
};
