import { Router, Request, Response } from "express";
import CourseController from "../../controllers/courseController";

const router = Router();

router.post('/scrape', CourseController.scrapeCourse);