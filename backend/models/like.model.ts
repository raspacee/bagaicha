import { pool } from "../db/index";

const createPostLike = async (postId: string, userId: string) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const text = `
    INSERT INTO "postLike" ("postId", "likerId")
    VALUES ($1, $2);
    `;
    const values = [postId, userId];
    await client.query(text, values);

    const text2 = `
    UPDATE "post"
      SET "likeCount" = "likeCount" + 1
    WHERE "id" = $1`;
    const values2 = [postId];
    await client.query(text2, values2);

    await client.query("COMMIT");
  } catch (err) {
    console.log(err);
    await client.query("ROLLBACK");
    throw new Error();
  } finally {
    client.release();
  }
};

const deletePostLike = async (postId: string, userId: string) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const text = `
    DELETE FROM "postLike"
      WHERE "postId" = $1
      AND "likerId" = $2;
    `;
    const values = [postId, userId];
    await client.query(text, values);

    const text2 = `
    UPDATE "post"
      SET "likeCount" = "likeCount" - 1
    WHERE "id" = $1`;
    const values2 = [postId];
    await client.query(text2, values2);

    await client.query("COMMIT");
  } catch (err) {
    console.log(err);
    await client.query("ROLLBACK");
    throw new Error();
  } finally {
    client.release();
  }
};

const exporter = {
  createPostLike,
  deletePostLike,
};

export default exporter;
