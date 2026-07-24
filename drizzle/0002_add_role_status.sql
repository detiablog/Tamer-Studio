ALTER TABLE "user" ADD COLUMN "role" varchar(50) DEFAULT 'user' NOT NULL;
ALTER TABLE "user" ADD COLUMN "status" varchar(50) DEFAULT 'pending' NOT NULL;
