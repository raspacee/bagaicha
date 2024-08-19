CREATE TABLE
	IF NOT EXISTS "notification" (
		"id" UUID PRIMARY KEY,
		"recipientId" UUID NOT NULL,
		"senderId" UUID NOT NULL,
		"postId" UUID,
		"commentId" UUID,
		"type" VARCHAR(50) NOT NULL,
		"isRead" BOOLEAN DEFAULT FALSE,
		"createdAt" TIMESTAMPTZ NOT NULL,
		CONSTRAINT "fkRecipient" FOREIGN KEY ("recipientId") REFERENCES "user_" ("id"),
		CONSTRAINT "fkSender" FOREIGN KEY ("senderId") REFERENCES "user_" ("id"),
		CONSTRAINT "fkPost" FOREIGN KEY ("postId") REFERENCES "post" ("id") ON DELETE CASCADE,
		CONSTRAINT "fkComment" FOREIGN KEY ("commentId") REFERENCES "comment" ("id") ON DELETE CASCADE
	);