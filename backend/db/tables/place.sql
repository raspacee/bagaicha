CREATE TABLE IF NOT EXISTS "place" (
  "id" UUID PRIMARY KEY,
  "osmId" VARCHAR(20) NOT NULL,
  "name" VARCHAR(250) NOT NULL,
  "lat" DOUBLE PRECISION NOT NULL,
  "lon" DOUBLE PRECISION NOT NULL,
  "openDays" TEXT[], 
  "openingTime" TIME,
  "closingTime" TIME,
  "placeFeatures" TEXT[],
  "coverImgUrl" TEXT,
  "foodsOffered" TEXT[],
  "ownedBy" UUID,
  "createdAt" TIMESTAMPTZ NOT NULL,

  CONSTRAINT "fkOwnedBy"
    FOREIGN KEY ("ownedBy")
    REFERENCES "user_"("id")
);