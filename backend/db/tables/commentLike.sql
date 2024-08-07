CREATE TABLE
    IF NOT EXISTS "commentLike" (
        "likerId" UUID NOT NULL,
        "commentId" UUID NOT NULL,
        CONSTRAINT "fkLiker" FOREIGN KEY ("likerId") REFERENCES "user_" ("id"),
        CONSTRAINT "fkComment" FOREIGN KEY ("commentId") REFERENCES "comment" ("id"),
        CONSTRAINT "uniqueLikerComment" UNIQUE ("likerId", "commentId")
    );