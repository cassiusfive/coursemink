import scraper from "./services/scraper.js";
import { Scheduler } from "./services/scheduler.js";
import { Course } from "./shared.types.js";
import CourseServices from "./services/courseServices.js";
import ProfServices from "./services/profServices.js";

const courseIds = [134, 808, 1139, 1448, 1944];

try {
    const courses = await Promise.all(
        courseIds.map((id) => CourseServices.getCourse(id))
    );
    console.log(courses);
    const schedules = Scheduler.findSchedules(courses);
    console.log(schedules[0]);
} catch (e) {
    if (e instanceof Error) {
        console.error(e);
    }
}
