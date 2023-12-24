import RegistrationScraper from "./scraping/registrationScraper.js";
import Scheduler from "./scheduling/scheduler.js";

const scraper = new RegistrationScraper();

const courseNames = [
    'VECTOR CALCULUS I',
    'WEIGHT TRAINING I',
    'DESIGN ENGINEERING AND PROBLEM SOLVING',
    '*INTRODUCTION TO THE VISUAL ARTS',
    '*HISTORY OF THE UNITED STATES',
]

const courses = [];

for (const courseName of courseNames) {
    courses.push(await scraper.scrapeCourse(courseName));
}

for (const schedule of Scheduler.generateSchedules(courses)) {
    console.log(schedule);
}