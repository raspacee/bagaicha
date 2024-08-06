CREATE TABLE
    IF NOT EXISTS "user_" (
        "id" UUID PRIMARY KEY,
        "firstName" VARCHAR(50) NOT NULL,
        "lastName" VARCHAR(50) NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        "email" VARCHAR(100) UNIQUE NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL,
        "profilePictureUrl" VARCHAR(500),
        "moderationLvl" SMALLINT DEFAULT 0,
        "bio" VARCHAR(500) DEFAULT NULL
    );