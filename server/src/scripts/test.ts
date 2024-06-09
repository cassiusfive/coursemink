import scraper from "../services/scraper.js";
import CourseServices from "../services/courseServices.js";

try {
  const cs = scraper.scrapeCourse(
    "CS162",
    "INTRODUCTION TO COMPUTER SCIENCE II",
  );
  console.log("finished");
} catch (e) {
  if (e instanceof Error) {
    console.error(e);
  }
}
