CREATE TABLE
    IF NOT EXISTS "post" (
        "id" UUID PRIMARY KEY,
        "authorId" UUID NOT NULL,
        "body" TEXT NOT NULL,
        "imageUrl" VARCHAR(500) NOT NULL,
        "likeCount" INTEGER DEFAULT 0,
        "placeId" UUID NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL,
        "rating" SMALLINT NOT NULL,
        CONSTRAINT "fkAuthor" FOREIGN KEY ("authorId") REFERENCES "user_" ("id"),
        CONSTRAINT "fkPlace" FOREIGN KEY ("placeId") REFERENCES "place" ("id")
    );