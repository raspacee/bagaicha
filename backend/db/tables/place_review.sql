CREATE TABLE
  IF NOT EXISTS "placeReview" (
    "id" UUID PRIMARY KEY,
    "placeId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "body" VARCHAR(500),
    "createdAt" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "fkAuthor" FOREIGN KEY ("authorId") REFERENCES "user_" ("id"),
    CONSTRAINT "fkPlace" FOREIGN KEY ("placeId") REFERENCES "place" ("id")
  );