import {
  serial,
  text,
  integer,
  time,
  timestamp,
  pgTable,
  boolean,
} from "drizzle-orm/pg-core";

export const colleges = pgTable("colleges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const terms = pgTable("terms", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  description: text("description").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  termId: text("term_id")
    .notNull()
    .references(() => terms.id),
  code: text("code").notNull(),
  title: text("title").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const offerings = pgTable("offerings", {
  id: serial("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id),
});

export const sections = pgTable("courses", {
  id: serial("id").primaryKey(),
  offeringId: text("offering_id")
    .notNull()
    .references(() => offerings.id),
  crn: integer("crn").notNull().unique(),
  start: time("start_time").notNull(),
  end: time("end_time").notNull(),
  onMonday: boolean("on_monday").notNull().default(false),
  onTuesday: boolean("on_tuesday").notNull().default(false),
  onWednesday: boolean("on_wednesday").notNull().default(false),
  onThursday: boolean("on_thursday").notNull().default(false),
  onFriday: boolean("on_friday").notNull().default(false),
  section: text("section").notNull(),
  maxEnrollment: integer("max_enrollment").notNull(),
  currentEnrollment: integer("current_enrollment").notNull(),
  maxWaitlist: integer("max_waitlist").notNull(),
  currentWaitlist: integer("current_waitlist").notNull(),
  location: text("location").notNull(),
});
