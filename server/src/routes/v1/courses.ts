import { Router, Request, Response } from "express";
import CourseController from "../../controllers/courseController.js";

const courseRouter = Router();

courseRouter.get('/', CourseController.getCourses);
courseRouter.get('/:id', CourseController.getCourse);

export default courseRouter;