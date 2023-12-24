import RegistrationScraper from "./scraping/registrationScraper.js";

const scraper = new RegistrationScraper();

const course = await scraper.scrapeCourse('VECTOR CALCULUS I');

for (const offering of course.offerings) {
    console.log(offering);
}