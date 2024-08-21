import { Pool, QueryConfigValues } from "pg";

const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: port,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 50,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 4000,
});

const query = async <I = any[]>(text: string, params: QueryConfigValues<I>) => {
  return pool.query(text, params);
};

export { query, pool };
