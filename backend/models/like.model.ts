import { pool } from "../db/index";
import { v4 as uuidv4 } from "uuid";

const createPostLike = async (postId: string, userId: string) => {
  const text = `
  INSERT INTO "postLike" ("postId", "likerId")
  VALUES ($1, $2);
`;
  const values = [postId, userId];
  await pool.query(text, values);
};

const deletePostLike = async (postId: string, userId: string) => {
  const text = `
  DELETE FROM "postLike"
  WHERE "postId" = $1
    AND "likerId" = $2;
`;
  const values = [postId, userId];
  await pool.query(text, values);
};

const exporter = {
  createPostLike,
  deletePostLike,
};

export default exporter;
