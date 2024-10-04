CREATE TABLE
    IF NOT EXISTS "operatingHour" (
        "id" SERIAL PRIMARY KEY,
        "openingTime" TIME,
        "closingTime" TIME,
        "day" VARCHAR(9) NOT NULL CHECK (
            "day" IN (
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday'
            )
        ),
        "placeId" UUID NOT NULL,
        CONSTRAINT "fkPlace" FOREIGN KEY ("placeId") REFERENCES "place" ("id"),
        CONSTRAINT "uniqueOperatingHour" UNIQUE ("day", "placeId")
    );