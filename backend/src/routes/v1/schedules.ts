import { Router, Request, Response } from "express";
import ScheduleController from "../../controllers/scheduleController.js";

const scheduleRouter = Router();

scheduleRouter.post('/', ScheduleController.createSchedule);

export default scheduleRouter;