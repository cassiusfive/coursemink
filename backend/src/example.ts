import RegistrationScraper from "./scraping/registrationScraper.js";
import Scheduler from "./scheduling/scheduler.js";
import { Course } from "./shared.types.js";

const scraper = new RegistrationScraper();

const courseNames = [
    'VECTOR CALCULUS I',
    'WEIGHT TRAINING I',
    'DESIGN ENGINEERING AND PROBLEM SOLVING',
    '*INTRODUCTION TO THE VISUAL ARTS',
    '*HISTORY OF THE UNITED STATES',
]

const courses: Course[] = [];

for (const courseName of courseNames) {
    courses.push(await scraper.scrapeCourse(courseName));
}

const bestSchedule = Scheduler.findOptimal(courses, {
    preferredStartTime: 600,
    preferredEndTime: 1020
})

console.log(bestSchedule);