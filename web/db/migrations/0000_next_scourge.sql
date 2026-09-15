CREATE TYPE "public"."motorcycle_status" AS ENUM('AVAILABLE', 'RESERVED', 'SOLD');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN');--> statement-breakpoint
CREATE TABLE "motorcycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"manufacture_year" integer NOT NULL,
	"model_year" integer NOT NULL,
	"color" text NOT NULL,
	"plate" text NOT NULL,
	"mileage" integer DEFAULT 0 NOT NULL,
	"entry_date" date NOT NULL,
	"status" "motorcycle_status" DEFAULT 'AVAILABLE' NOT NULL,
	"fipe_code" text,
	"fipe_price_id" text,
	"fipe_model_id" text,
	"fipe_make_id" text,
	"fipe_fuel_id" text,
	"fipe_type_id" text,
	"fipe_make_name" text,
	"fipe_model_name" text,
	"fipe_fuel_name" text,
	"fipe_price_cents" integer,
	"fipe_reference_month" integer,
	"fipe_reference_year" integer,
	"fipe_updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'ADMIN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
