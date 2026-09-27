CREATE TABLE "UserAvatar" (
    "userId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "version" TEXT NOT NULL,
    CONSTRAINT "UserAvatar_pkey" PRIMARY KEY ("userId")
);
ALTER TABLE "UserAvatar" ADD CONSTRAINT "UserAvatar_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
