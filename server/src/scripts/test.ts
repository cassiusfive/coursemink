import scraper from "../services/scraper.js";
import CourseServices from "../services/courseServices.js";

try {
  const cs = await scraper.scrapeCourse("WR121Z", "*Technical Writing");
  console.log(cs);
  console.log("finished");
} catch (e) {
  if (e instanceof Error) {
    console.error(e);
  }
}
