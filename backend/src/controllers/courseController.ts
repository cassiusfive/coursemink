import { Request, Response } from "express";
import scraper from "../services/scraper.js";
import CourseServices from "../services/courseServices.js";

export default class CourseController {
    static async getCourse(req: Request, res: Response): Promise<void> {
        try {
            const id: number = +req.params.id;
            const courseInfo = await CourseServices.getCourseInfo(id);
            const now = new Date();
            // 3600000 = 1 hour
            const updateThreshold = 3600000;
            if (
                now.getTime() - courseInfo.updated_at.getTime() >
                updateThreshold
            ) {
                const course = await scraper.scrapeCourse(courseInfo.title);
                res.status(200).json(course);
                await CourseServices.insertCourse(course, id);
                return;
            }
            const course = await CourseServices.getCourse(id);
            res.status(200).json(course);
        } catch (error) {
            console.log(error);
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
