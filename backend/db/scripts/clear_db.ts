require("dotenv").config();

import { pool } from "../index";

async function main() {
  await pool.query(
    "DROP SCHEMA public CASCADE;\
CREATE SCHEMA public;\
GRANT ALL ON SCHEMA public TO postgres;\
GRANT ALL ON SCHEMA public TO public;"
  );
  console.log("All tables dropped");
}

main();
