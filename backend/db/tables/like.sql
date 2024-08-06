CREATE TABLE
    IF NOT EXISTS "postLike" (
        "id" UUID PRIMARY KEY,
        "likerId" UUID NOT NULL,
        "postId" UUID NOT NULL,
        CONSTRAINT "fkLiker" FOREIGN KEY ("likerId") REFERENCES "user_" ("id"),
        CONSTRAINT "fkPost" FOREIGN KEY ("postId") REFERENCES "post" ("id")
    );