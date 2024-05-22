require("dotenv").config();
import fs from "fs";
import path from "path";

import { Pool, PoolClient } from "pg";
import { pool } from "../index";

async function main() {
  const client = await pool.connect();
  client.query("start transaction");
  console.log("Transaction started");
  try {
    await create_user(client);
    await create_place(client);
    await create_review(client);
    await create_like(client);
    client.query("end transaction");
    console.log("Transaction ended");
  } catch (err) {
    client.query("rollback");
    console.log("Error: Rolling back changes");
    console.error(err);
  } finally {
    client.release();
    console.log("Client released");
  }
}

async function create_user(client: PoolClient) {
  const file = fs.readFileSync(
    path.join(__dirname, "..", "tables", "user.sql"),
    "utf-8"
  );
  await client.query(file);
  console.log("User table created");
}

async function create_place(client: PoolClient) {
  const file = fs.readFileSync(
    path.join(__dirname, "..", "tables", "place.sql"),
    "utf-8"
  );
  await client.query(file);
  console.log("Place table created");
}

async function create_review(client: PoolClient) {
  const file = fs.readFileSync(
    path.join(__dirname, "..", "tables", "review.sql"),
    "utf-8"
  );
  await client.query(file);
  console.log("Review table created");
}

async function create_like(client: PoolClient) {
  const file = fs.readFileSync(
    path.join(__dirname, "..", "tables", "like.sql"),
    "utf-8"
  );
  await client.query(file);
  console.log("Like table created");
}

main();
