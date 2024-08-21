import { pool } from "../db";
import { OwnershipRequest, OwnershipRequestForm } from "../types";
import { v4 as uuid } from "uuid";

const createOwnershipRequest = async (
  form: OwnershipRequestForm,
  imageUrl: string,
  requestedBy: string
) => {
  const id = uuid();
  const text = `
  INSERT INTO "ownershipRequest" (
    "id",
    "requestedBy",
    "placeId",
    "documentImageUrl",
    "requestedDate"
  )
  VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [
    id,
    requestedBy,
    form.placeId,
    imageUrl,
    new Date().toISOString(),
  ];
  await pool.query(text, values);
};

const getAllPlaceOwnershipRequests = async (): Promise<OwnershipRequest[]> => {
  const text = `
  SELECT * 
  FROM "ownershipRequest" 
  WHERE "ownershipGranted" = false
`;
  const result = await pool.query(text);
  if (result.rowCount == 0) return [];
  return result.rows;
};

const grantRequestOwnership = async (requestId: string) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const text1 = `
    UPDATE "ownershipRequest"
    SET "ownershipGranted" = true
    WHERE "id" = $1;`;
    const values = [requestId];
    await client.query(text1, values);

    const text2 = `
    UPDATE "place"
    SET "ownedBy" = (
      SELECT "requestedBy"
      FROM "ownershipRequest"
      WHERE "id" = $1
    )
    WHERE "id" = (
      SELECT "placeId"
      FROM "ownershipRequest"
      WHERE "id" = $1
    );`;
    await client.query(text2, values);

    await client.query("COMMIT");
  } catch (err) {
    console.error(err);
    await client.query("ROLLBACK");
    throw new Error("SQL Error while granting request ownership");
  } finally {
    client.release();
  }
};

export default {
  createOwnershipRequest,
  getAllPlaceOwnershipRequests,
  grantRequestOwnership,
};
