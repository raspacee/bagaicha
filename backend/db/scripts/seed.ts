import dotenv from "dotenv";
//dotenv.config({ path: __dirname + "../../.env" });
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

const placesId = [
  "0005cd23-53b1-47a4-97c8-c3a5cb5d3af2",
  "000613bb-73e1-447d-8490-9bca5ba08e89",
  "00063f2a-053b-4a8c-a863-3217c0b3fcfc",
  "0010408e-c6aa-450b-98c4-2e845191eba6",
  "001fa65f-4f94-46c7-96b0-db224e597419",
  "002a759e-c050-46fc-8515-69061427a770",
  "0043b095-ce78-4c35-9c05-54bcf536f680",
  "004ac902-139b-4b25-81bf-9d4088a1bcaf",
  "004cf304-1aaa-4bed-bfce-43893d039c11",
  "006a329e-13ef-450e-a879-72d99139ecae",
  "006c9757-6bc5-4e13-aa0c-44ad772916ed",
  "0077202d-4490-4454-add7-5f4f1830e1ca",
  "0077d610-05b1-40bf-8c4d-672838d9b8de",
  "00785377-163a-4229-969e-ff1689194782",
  "00850357-6523-4ca7-a693-7187a22d1954",
  "009148a7-bb36-4152-81e5-b47293168f27",
  "0097a571-8139-4233-a140-42f1971d084e",
  "00a82a02-eae7-4b46-9ff1-abb0d64bc0a7",
  "00cbf8c4-121b-44f2-a781-3b74452bca91",
  "00d19c0b-f9c6-4eb2-b3ad-bd1253de66b3",
];

const pictures = [
  "https://res.cloudinary.com/dqiqiczlk/image/upload/v1712744937/dub6gcp7xqu14hp1klnl.jpg",
  "https://res.cloudinary.com/dqiqiczlk/image/upload/v1712996938/hx9lqmxpdbz5jb8rwmmt.jpg",
  "https://res.cloudinary.com/dqiqiczlk/image/upload/v1712997209/zvz2nd86ryancto4b7u0.webp",
  "https://res.cloudinary.com/dqiqiczlk/image/upload/v1712997120/frxrrv8wmkigluy6rih3.jpg",
];

const main = async () => {
  const authorId = "9664807e-ac7e-48c3-b5cb-c201a8cd73b0";
  for (let i = 0; i < 1000; i++) {
    const imageUrl = pictures[Math.floor(Math.random() * pictures.length)];
    const placeId = placesId[Math.floor(Math.random() * placesId.length)];
    const rating = Math.floor(Math.random() * 5) + 1;
    const id = uuidv4();
    const text = `insert into post (id, "authorId", body, "imageUrl", "placeId", 
    "createdAt", rating)
    values ($1, $2, $3, $4, $5, $6, $7);`;
    const values = [
      id,
      authorId,
      "This is post " + i,
      imageUrl,
      placeId,
      new Date().toISOString(),
      rating,
    ];
    await pool.query(text, values);
    console.log(`Inserted post no. ${i}`);
  }
};

main();
