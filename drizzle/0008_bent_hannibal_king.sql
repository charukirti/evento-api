ALTER TABLE "events" ADD CONSTRAINT "seat_zero_check" CHECK ("events"."available_seats" >= 0);--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "seat_max_check" CHECK ("events"."available_seats" <= "events"."total_seats");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "time_check" CHECK ("events"."end_time" > "events"."start_time");