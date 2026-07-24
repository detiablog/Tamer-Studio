ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "preferred_language" varchar(10) DEFAULT 'en' NOT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "preferred_currency" varchar(10) DEFAULT 'USD' NOT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "preferred_country" varchar(10);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "preferred_timezone" varchar(100);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "auto_detect_locale" boolean DEFAULT true NOT NULL;
