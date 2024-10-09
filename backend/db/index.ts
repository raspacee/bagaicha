import { Pool, QueryConfigValues } from "pg";

const devConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 50,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 4000,
};

const prodConfig = {
  host: process.env.DB_HOST_PROD,
  port: parseInt(process.env.DB_PORT_PROD || "5432"),
  user: process.env.DB_USER_PROD,
  database: process.env.DB_NAME_PROD,
  password: process.env.DB_PASSWORD_PROD,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 50,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 4000,
};

const pool = new Pool(
  process.env.NODE_ENV == "development" ? devConfig : prodConfig
);

const query = async <I = any[]>(text: string, params: QueryConfigValues<I>) => {
  return pool.query(text, params);
};

export { query, pool };
