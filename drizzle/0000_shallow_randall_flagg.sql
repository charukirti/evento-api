CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar(60) NOT NULL,
	"age" integer,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
