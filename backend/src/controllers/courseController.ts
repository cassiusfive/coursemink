import { Request, Response } from "express";
import scraper from "../services/scraper.js";

export default class CourseController {
	static async scrapeCourse(req: Request, res: Response): Promise<void> {
		try {
			const { title } = req.body;
			const course = await scraper.scrapeCourse(title);

		} catch (error) {
			res.status(500).json({ error: "Scrape failed" });
		}
	}
}