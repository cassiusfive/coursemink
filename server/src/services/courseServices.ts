import db from "../db/database.js";
import { Course } from "../db/schema";

type CourseInfo = {
  id: number;
  title: string;
  code: string;
  updated_at: Date;
};

export default class CourseServices {
  static async insertCourse(course: Course, courseId?: number): Promise<void> {
    return;
  }

  static async getCourses(): Promise<Course[]> {
    return [];
  }

  static async getCourseInfo(id: number): Promise<CourseInfo> {
    return { id: id, title: "meow", code: "cs162", updated_at: new Date() };
  }

  static async getCourse(id: number): Promise<Course> {
    return {
      id: id,
      title: "meow",
      code: "cs162",
      updatedAt: new Date(),
      offerings: [],
    };
  }

  // private static parseStamp(time: string): Timestamp {
  //   const [hours, minutes, seconds] = time.split(":");
  //   return { hours: +hours, minutes: +minutes };
  // }
}
