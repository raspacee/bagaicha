CREATE TABLE
    IF NOT EXISTS "ownershipRequest" (
        "id" UUID PRIMARY KEY,
        "requestedBy" UUID NOT NULL,
        "placeId" UUID NOT NULL,
        "ownershipGranted" BOOLEAN DEFAULT FALSE,
        "documentImageUrl" VARCHAR(500) NOT NULL,
        "requestedDate" TIMESTAMPTZ NOT NULL,
        CONSTRAINT "fkRequestedBy" FOREIGN KEY ("requestedBy") REFERENCES "user_" ("id"),
        CONSTRAINT "fkPlace" FOREIGN KEY ("placeId") REFERENCES "place" ("id")
    );