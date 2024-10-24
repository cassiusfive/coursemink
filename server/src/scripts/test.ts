import Banner9Scraper from "./../scrapers/banner9.js";

try {
  const scraper = new Banner9Scraper(
    "https://prodapps.isadm.oregonstate.edu/StudentRegistrationSsb/ssb/",
  );
  const courses = await scraper.scrapeAllCourses("202501");
  console.log(courses);
} catch (e) {
  if (e instanceof Error) {
    console.error(e);
  }
}
