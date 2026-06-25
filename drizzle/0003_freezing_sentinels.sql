ALTER TABLE "refresh_token" RENAME COLUMN "token" TO "jti";--> statement-breakpoint
ALTER TABLE "refresh_token" DROP CONSTRAINT "refresh_token_token_unique";--> statement-breakpoint
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_jti_unique" UNIQUE("jti");