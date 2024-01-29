import { Request, Response } from "express";
import CourseServices from "../services/courseServices.js";
import { Scheduler } from "../services/scheduler.js";

export default class ScheduleController {
    static async createSchedule(req: Request, res: Response): Promise<void> {
        console.log(req.body);
        try {
            const courseIds: number[] = req.body.courses;
            const courses = await Promise.all(
                courseIds.map((id) => CourseServices.getCourse(id))
            );
            const schedules = Scheduler.findSchedules(courses);
            res.status(200).json(schedules);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Failed to determine schedules" });
        }
    }
}
