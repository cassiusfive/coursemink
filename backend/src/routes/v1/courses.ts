import { Router, Request, Response } from "express";
import CourseController from "../../controllers/courseController.js";

const router = Router();

router.get('/courses', CourseController.getCourses);

export default router;