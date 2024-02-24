import { SchedulerWeights } from "./../services/scheduler";
import { Request, Response } from "express";
import CourseServices from "../services/courseServices.js";
import { Scheduler } from "../services/scheduler.js";

const isFulfilled = <T>(
    input: PromiseSettledResult<T>
): input is PromiseFulfilledResult<T> => input.status === "fulfilled";

export default class ScheduleController {
    static async createSchedule(req: Request, res: Response): Promise<void> {
        try {
            const courseIds: number[] = req.body.courses;
            if (courseIds.length > 6) {
                throw new Error("Too many courses provided.");
            }
            const courses = await Promise.allSettled(
                courseIds.map((id) => CourseServices.getCourse(id))
            );
            const options: Partial<SchedulerWeights> | undefined =
                req.body.options;
            const schedules = Scheduler.findSchedules(
                courses.filter(isFulfilled).map((res) => res.value),
                options
            );
            res.status(200).json(schedules);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Failed to determine schedules" });
        }
    }
}
