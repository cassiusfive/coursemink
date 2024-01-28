import { Request, Response } from "express";
import scraper from "../services/scraper.js";
import CourseServices from "../services/courseServices.js";

export default class CourseController {
    static async getCourse(req: Request, res: Response): Promise<void> {
        try {
            const id: number = +req.params.id;
            const course = await CourseServices.getCourse(id);
            res.status(200).json(course);
        } catch (error) {
            res.status(500).json({ error: "Course doesn't meet standards" });
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
