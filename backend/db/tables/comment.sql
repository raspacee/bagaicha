CREATE TABLE
	"comment" (
		"id" UUID PRIMARY KEY,
		"postId" UUID NOT NULL,
		"authorId" UUID NOT NULL,
		"body" VARCHAR(500) NOT NULL,
		"createdAt" TIMESTAMPTZ NOT NULL,
		"likeCount" INTEGER DEFAULT 0,
		CONSTRAINT "fkPost" FOREIGN KEY ("postId") REFERENCES "post" ("id") ON DELETE CASCADE,
		CONSTRAINT "fkAuthor" FOREIGN KEY ("authorId") REFERENCES "user_" ("id")
	);