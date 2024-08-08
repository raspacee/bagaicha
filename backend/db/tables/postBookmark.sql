CREATE TABLE
    IF NOT EXISTS "postBookmark" (
        "id" UUID NOT NULL,
        "userId" UUID NOT NULL,
        "postId" UUID NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL,
        CONSTRAINT "fkUser" FOREIGN KEY ("userId") REFERENCES "user_" ("id"),
        CONSTRAINT "fkPost" FOREIGN KEY ("postId") REFERENCES "post" ("id"),
        CONSTRAINT "uniquePostBookmark" UNIQUE ("userId", "postId")
    );