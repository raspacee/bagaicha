CREATE TABLE
    IF NOT EXISTS "reviewBookmark" (
        "id" SERIAL PRIMARY KEY,
        "userId" UUID NOT NULL,
        "postId" UUID NOT NULL,
        "createdAt" TIMESTAMPTZ,
        CONSTRAINT "fkUser" FOREIGN KEY ("userId") REFERENCES "user_" ("id"),
        CONSTRAINT "fkPost" FOREIGN KEY ("postId") REFERENCES "post" ("id")
    );