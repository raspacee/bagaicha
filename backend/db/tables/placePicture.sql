CREATE TABLE
    IF NOT EXISTS "placeImage" (
        "id" SERIAL PRIMARY KEY,
        "imageUrl" TEXT NOT NULL,
        "placeId" UUID NOT NULL,
        "addedBy" UUID NOT NULL,
        "description" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL,
        CONSTRAINT "fkPlace" FOREIGN KEY ("placeId") REFERENCES "place" ("id"),
        CONSTRAINT "fkAddedBy" FOREIGN KEY ("addedBy") REFERENCES "user_" ("id")
    );