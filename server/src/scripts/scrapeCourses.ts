import scraper from "../services/scraper.js";
import CourseServices from "../services/courseServices.js";

try {
  const emptyCourses = await scraper.scrapeEmptyCourses();
  console.log(emptyCourses);
  await Promise.allSettled(
    emptyCourses.map((course) => {
      return CourseServices.insertCourse(course);
    }),
  );
  console.log("finished");
} catch (e) {
  if (e instanceof Error) {
    console.error(e);
  }
}
