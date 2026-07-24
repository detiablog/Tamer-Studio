DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'email_verified') THEN
    ALTER TABLE "user" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'image') THEN
    ALTER TABLE "user" ADD COLUMN "image" text;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workspace' AND column_name = 'description') THEN
    ALTER TABLE "workspace" ADD COLUMN "description" text;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workspace' AND column_name = 'owner_id') THEN
    ALTER TABLE "workspace" ADD COLUMN "owner_id" text NOT NULL DEFAULT '';
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'owner_id') THEN
    ALTER TABLE "organization" ADD COLUMN "owner_id" text NOT NULL DEFAULT '';
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization' AND column_name = 'settings') THEN
    ALTER TABLE "organization" ADD COLUMN "settings" jsonb DEFAULT '{}' NOT NULL;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workspace' AND column_name = 'settings') THEN
    ALTER TABLE "workspace" ADD COLUMN "settings" jsonb DEFAULT '{}' NOT NULL;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workspace' AND column_name = 'limits') THEN
    ALTER TABLE "workspace" ADD COLUMN "limits" jsonb DEFAULT '{}' NOT NULL;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice' AND column_name = 'subscription_id') THEN
    ALTER TABLE "invoice" ADD COLUMN "subscription_id" text;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice' AND column_name = 'line_items') THEN
    ALTER TABLE "invoice" ADD COLUMN "line_items" jsonb DEFAULT '[]' NOT NULL;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice' AND column_name = 'metadata') THEN
    ALTER TABLE "invoice" ADD COLUMN "metadata" jsonb DEFAULT '{}' NOT NULL;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription' AND column_name = 'cancel_at_period_end') THEN
    ALTER TABLE "subscription" ADD COLUMN "cancel_at_period_end" text NOT NULL DEFAULT 'false';
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription' AND column_name = 'metadata') THEN
    ALTER TABLE "subscription" ADD COLUMN "metadata" jsonb DEFAULT '{}' NOT NULL;
  END IF;
END $$;
