import pool from "../utils/database.js";
import { Course } from "../shared.types.js";

async function insertCourse(course: Course): Promise<void> {
	const courseSql = 'INSERT INTO course(title, code) VALUES($1, $2) RETURNING id';
	const courseValues = [course.title, course.code];
	const courseRes = await pool.query(courseSql, courseValues);
	for (const offering of course.offerings) {
		const offeringSql = 'INSERT INTO offering(course_id) VALUES($1) RETURNING id';
		const offeringRes = await pool.query(offeringSql, [courseRes.rows[0].id]);
		for (const sectionType of offering) {
			const courseSql = 'INSERT INTO course(title, code) VALUES($1, $2) RETURNING *';
			const courseValues = [course.title, course.code]
			const courseRes = await pool.query(courseSql, courseValues);
			for (const section of sectionType.sections) {
				const sectionSql = 'INSERT INTO section()';
			}
		}
	}
}