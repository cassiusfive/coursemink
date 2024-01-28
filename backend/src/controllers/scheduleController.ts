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
                    return CourseServices.getCourse(id);
                })
            );
            const schedules = Scheduler.findSchedules(courses);
            console.log(schedules);
            res.status(200).json();
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Failed to create schedule" });
        }
    }
}
