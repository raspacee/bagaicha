import { pool } from "../db";
import { PlaceImage } from "../types";
import { v2 as cloudinary } from "cloudinary";

const addImageToDB = async (
  imageUrl: string,
  placeId: string,
  addedBy: string,
  description: string,
  imageId: string,
  isMenu: boolean = false
) => {
  const text = `
  INSERT INTO "placeImage" 
    ("imageUrl", "placeId", "addedBy", "description", "createdAt", "cloudinaryId", "isMenu")
  VALUES 
    ($1, $2, $3, $4, $5, $6, $7)`;
  const values = [
    imageUrl,
    placeId,
    addedBy,
    description,
    new Date().toISOString(),
    imageId,
    isMenu,
  ];
  await pool.query(text, values);
};

const getImagesOfPlace = async (
  placeId: string,
  filterQuery: string
): Promise<PlaceImage[] | null> => {
  const text = `
  SELECT * 
  FROM "placeImage"
  WHERE "placeId" = $1
  AND description ILIKE $2`;
  const values = [placeId, `%${filterQuery}%`];

  const result = await pool.query(text, values);
  if (result.rowCount == 0) return null;
  return result.rows as PlaceImage[];
};

const getMenusOfPlace = async (
  placeId: string
): Promise<PlaceImage[] | null> => {
  const text = `
  SELECT * 
  FROM "placeImage"
  WHERE "placeId" = $1
  AND "isMenu" = true`;
  const values = [placeId];

  const result = await pool.query(text, values);
  if (result.rowCount == 0) return null;
  return result.rows as PlaceImage[];
};

const deleteImage = async (cloudinaryId: string) => {
  const text = `DELETE FROM "placeImage" WHERE "cloudinaryId" = $1;`;
  const values = [cloudinaryId];
  await pool.query(text, values);
  await cloudinary.uploader.destroy(cloudinaryId);
};

const getSingleImage = async (imageId: number): Promise<PlaceImage | null> => {
  const text = `
  SELECT *
  FROM "placeImage"
  WHERE id = $1
  `;
  const values = [imageId];
  const result = await pool.query(text, values);
  if (result.rowCount == 0) return null;
  return result.rows[0];
};

export default {
  addImageToDB,
  getImagesOfPlace,
  deleteImage,
  getSingleImage,
  getMenusOfPlace,
};
