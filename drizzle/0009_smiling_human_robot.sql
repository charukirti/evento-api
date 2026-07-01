CREATE TABLE "organizers" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"organization_name" varchar(60) NOT NULL,
	"bio" text NOT NULL,
	"website" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizers" ADD CONSTRAINT "organizers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;