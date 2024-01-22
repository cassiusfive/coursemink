import scraper from "./services/scraper.js";
import Scheduler from "./services/scheduler.js";
import { Course } from "./shared.types.js";
import CourseServices from "./services/courseServices.js";

const courseNames = [
    'VECTOR CALCULUS I',
    'WEIGHT TRAINING I',
    'DESIGN ENGINEERING AND PROBLEM SOLVING',
    '*INTRODUCTION TO THE VISUAL ARTS',
    '*HISTORY OF THE UNITED STATES',
]

// const courses: Course[] = [];

// const course = await scraper.scrapeCourse(courseNames[0]);

// await CourseServices.insertCourse(course);
try {
	// const course = await scraper.scrapeCourse(courseNames[0]);
	// await CourseServices.insertCourse(course);
	// const course = await CourseServices.getCourse(13);
	// console.log(course.offerings[0][1].sections)
	console.log(await CourseServices.getCourses());
} catch (e) {
	if (e instanceof Error) {
		console.log(e)
	}
}

