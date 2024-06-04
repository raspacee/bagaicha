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
    await create_comment(client);
    await create_notification(client);
    await create_place_review(client);
    await create_bookmark(client);
    await create_search(client);
    await create_functions(client);
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

async function create_comment(client: PoolClient) {
  const file = fs.readFileSync(
    path.join(__dirname, "..", "tables", "comment.sql"),
    "utf-8",
  );
  await client.query(file);
  console.log("Comment table created");

  const file2 = fs.readFileSync(
    path.join(__dirname, "..", "tables", "comment_like.sql"),
    "utf-8",
  );
  await client.query(file2);
  console.log("Comment like table created");
}

async function create_functions(client: PoolClient) {
  const file = fs.readFileSync(
    path.join(__dirname, "..", "functions", "haversine.sql"),
    "utf-8",
  );
  await client.query(file);
  console.log("Database procedures created");
}

async function create_notification(client: PoolClient) {
  const file = fs.readFileSync(
    path.join(__dirname, "..", "tables", "notification.sql"),
    "utf-8",
  );
  await client.query(file);
  console.log("Notification table created");
}

async function create_bookmark(client: PoolClient) {
  const file = fs.readFileSync(
    path.join(__dirname, "..", "tables", "review_bookmark.sql"),
    "utf-8",
  );
  await client.query(file);
  console.log("Bookmark table created");
}

async function create_search(client: PoolClient) {
  const file = fs.readFileSync(
    path.join(__dirname, "..", "tables", "search.sql"),
    "utf-8",
  );
  await client.query(file);
  console.log("Search table created");
}

async function create_place_review(client: PoolClient) {
  const file = fs.readFileSync(
    path.join(__dirname, "..", "tables", "place_review.sql"),
    "utf-8",
  );
  await client.query(file);
  console.log("Place review table created");
}

async function create_user(client: PoolClient) {
  const file = fs.readFileSync(
    path.join(__dirname, "..", "tables", "user.sql"),
    "utf-8",
  );
  await client.query(file);
  console.log("User table created");
}

async function create_place(client: PoolClient) {
  const file = fs.readFileSync(
    path.join(__dirname, "..", "tables", "place.sql"),
    "utf-8",
  );
  await client.query(file);
  console.log("Place table created");
}

async function create_review(client: PoolClient) {
  const file = fs.readFileSync(
    path.join(__dirname, "..", "tables", "review.sql"),
    "utf-8",
  );
  await client.query(file);
  console.log("Review table created");
}

async function create_like(client: PoolClient) {
  const file = fs.readFileSync(
    path.join(__dirname, "..", "tables", "like.sql"),
    "utf-8",
  );
  await client.query(file);
  console.log("Like table created");
}

main();
