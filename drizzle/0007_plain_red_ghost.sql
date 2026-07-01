ALTER TABLE "events" RENAME COLUMN "date" TO "start_time";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "end_time" timestamp with time zone NOT NULL;