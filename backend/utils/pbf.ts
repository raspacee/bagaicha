import pbf2json from "pbf2json";
import through from "through2";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

type Node = {
  id: string;
  lat: number;
  lon: number;
  tags: {
    amenity: string;
    name?: string;
  };
};

let config = {
  file: "./locations.osm.pbf",
  tags: ["amenity"],
};

const main = async () => {
  const client = await pool.connect();
  await client.query("START TRANSACTION");

  pbf2json
    .createReadStream(config)
    .pipe(
      through.obj(async function (node: Node, e, next) {
        if (node.tags.name) {
          await client.query(
            `insert into place (id, "osmId", name, lat, lon, "createdAt") 
                values ($1, $2, $3, $4, $5, $6)`,
            [
              uuidv4(),
              node.id,
              node.tags.name,
              node.lat,
              node.lon,
              new Date().toISOString(),
            ]
          );
          console.log("Inserted ID", node.id);
        }
        next();
      })
    )
    .on("finish", async function () {
      await client.query("END TRANSACTION");
      console.log("Inserting pbf data into database successful");
      client.release();
    })
    .on("error", async function (error) {
      await client.query("ROLLBACK");
      client.release();
      console.error(error);
    });
};

main();
