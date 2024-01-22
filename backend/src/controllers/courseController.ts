import { Request, Response } from "express";
import scraper from "../services/scraper.js";
import CourseServices from "../services/courseServices.js";

export default class CourseController {
	static async scrapeCourse(req: Request, res: Response): Promise<void> {
		try {
			const { title } = req.body;
			const course = await scraper.scrapeCourse(title);
			await CourseServices.insertCourse(course);
		} catch (error) {
			res.status(500).json({ error: "Scrape failed" });
		}
	}

	static async getCourses(req: Request, res: Response): Promise<void> {
		try {
			const courses = await CourseServices.getCourses();
			res.status(200).json(courses);
		} catch (error) {
			res.status(500).json({ error: "Failed to get courses" });
		}
	}
}