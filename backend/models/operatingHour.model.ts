import { pool } from "../db";
import { OperatingHourForm } from "../types";

const createOperatingHour = async (operatingHour: OperatingHourForm) => {
  const text = `
  INSERT INTO "operatingHour" (
    "openingTime",
    "closingTime",
    day,
    "placeId"
  )
  VALUES ($1, $2, $3, $4);
`;
  const values = [
    operatingHour.openingTime || null,
    operatingHour.closingTime || null,
    operatingHour.day,
    operatingHour.placeId,
  ];
  await pool.query(text, values);
};

const removeOperatingHour = async (operatingHourId: number) => {
  const text = `
  DELETE FROM "operatingHour"
  WHERE id = $1;
`;
  const values = [operatingHourId];
  await pool.query(text, values);
};

const getOperatingHours = async (
  placeId: string
): Promise<OperatingHourForm[] | null> => {
  const text = `
  SELECT * 
  FROM "operatingHour"
  WHERE "placeId" = $1;
`;
  const values = [placeId];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return null;
  return result.rows;
};

export default {
  createOperatingHour,
  removeOperatingHour,
  getOperatingHours,
};
