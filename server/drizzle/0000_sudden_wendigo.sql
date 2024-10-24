CREATE TABLE IF NOT EXISTS "campuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "colleges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"registrationSystem" "registrationSystem" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"term_id" text NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "offerings" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"offering_id" text NOT NULL,
	"term_id" text NOT NULL,
	"crn" integer NOT NULL,
	"instructor" text NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"on_monday" boolean DEFAULT false NOT NULL,
	"on_tuesday" boolean DEFAULT false NOT NULL,
	"on_wednesday" boolean DEFAULT false NOT NULL,
	"on_thursday" boolean DEFAULT false NOT NULL,
	"on_friday" boolean DEFAULT false NOT NULL,
	"section" text NOT NULL,
	"max_enrollment" integer NOT NULL,
	"current_enrollment" integer NOT NULL,
	"max_waitlist" integer NOT NULL,
	"current_waitlist" integer NOT NULL,
	"location" text NOT NULL,
	CONSTRAINT "sections_crn_unique" UNIQUE("crn")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "terms" (
	"id" serial PRIMARY KEY NOT NULL,
	"campus_id" text NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_term_id_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "offerings" ADD CONSTRAINT "offerings_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sections" ADD CONSTRAINT "sections_offering_id_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."offerings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sections" ADD CONSTRAINT "sections_term_id_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "terms" ADD CONSTRAINT "terms_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
