import { Request, Response } from "express";
import CourseServices from "../services/courseServices.js";
import { Scheduler } from "../services/scheduler.js";
import scraper from "../services/scraper.js";

export default class ScheduleController {
    static async createSchedule(req: Request, res: Response): Promise<void> {
        try {
            const courseIds: number[] = req.body.courses;
            const courses = await Promise.all(
                courseIds.map(async (id) => {
                    const courseInfo = await CourseServices.getCourseInfo(id);
                    const now = new Date();
                    // 1 hour
                    if (
                        now.getTime() - courseInfo.updated_at.getTime() >
                        3600000
                    ) {
                        const course = await scraper.scrapeCourse(
                            courseInfo.title
                        );
                        await CourseServices.insertCourse(course, id);
                        return course;
                    }
                    return await CourseServices.getCourse(id);
                })
            );
            const schedule = Scheduler.findOptimal(courses);
            console.log(schedule);
            res.status(200).json();
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Failed to create schedule" });
        }
    }
}
