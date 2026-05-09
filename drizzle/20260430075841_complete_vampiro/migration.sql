ALTER TABLE "server_ban" ADD COLUMN "author" varchar(32) DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE "server_ban" ADD COLUMN "last_editor" varchar(32) DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE "server_ban" ADD COLUMN "updated_at" timestamp(0) with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "server_ban" ADD COLUMN "created_at" timestamp(0) with time zone DEFAULT now() NOT NULL;