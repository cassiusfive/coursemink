import scraper from "../services/scraper.js";
import ProfServices from "../services/profServices.js";

try {
    const profs = await scraper.scrapeProfessors();
    const res = await Promise.allSettled(
        profs.map((prof) => {
            return ProfServices.insertProf(prof);
        })
    );
    console.log("finished");
} catch (e) {
    if (e instanceof Error) {
        console.log(e.message);
    }
}
