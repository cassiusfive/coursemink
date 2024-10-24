import {
  serial,
  text,
  integer,
  time,
  timestamp,
  pgTable,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { Omit } from "utility-types";

const registrationSystemEnum = pgEnum("registrationSystem", ["Banner9"]);

export const colleges = pgTable("colleges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  registrationSystem: registrationSystemEnum("registrationSystem").notNull(),
});

export const campuses = pgTable("campuses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  description: text("description").notNull(),
});

export const terms = pgTable("terms", {
  id: serial("id").primaryKey(),
  campusId: text("campus_id")
    .notNull()
    .references(() => campuses.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  description: text("description").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  termId: text("term_id")
    .notNull()
    .references(() => terms.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  title: text("title").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const offerings = pgTable("offerings", {
  id: serial("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
});

export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  offeringId: text("offering_id")
    .notNull()
    .references(() => offerings.id, { onDelete: "cascade" }),
  campusId: text("term_id")
    .notNull()
    .references(() => terms.id),
  crn: integer("crn").notNull().unique(),
  instructor: text("instructor").notNull(),
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

export type InsertCollege = typeof colleges.$inferInsert;
export type SelectCollege = typeof colleges.$inferSelect;

export type InsertTerm = typeof terms.$inferInsert;
export type SelectTerm = typeof terms.$inferSelect;

export type InsertCourse = typeof courses.$inferInsert;
export type SelectCourse = typeof courses.$inferSelect;

export type InsertOffering = typeof offerings.$inferInsert;
export type SelectOffering = typeof offerings.$inferSelect;

export type InsertSection = typeof sections.$inferInsert;
export type SelectSection = typeof sections.$inferSelect;

export type Section = InsertSection;
export type Offering = Omit<InsertOffering, "courseId"> & {
  sections: Section[];
};
export type Course = Omit<InsertCourse, "termId"> & {
  offerings: Offering[];
};
