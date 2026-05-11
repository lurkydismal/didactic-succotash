ALTER TABLE "connection_log" ADD COLUMN "author" varchar(32) DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE "connection_log" ADD COLUMN "last_editor" varchar(32) DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE "connection_log" ADD COLUMN "updated_at" timestamp(0) with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "connection_log" ADD COLUMN "created_at" timestamp(0) with time zone DEFAULT now() NOT NULL;
-- Register triggers
CREATE TRIGGER update_table_updated_at
BEFORE UPDATE ON "connection_log"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();