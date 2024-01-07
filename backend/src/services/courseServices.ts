import pool from "../utils/database.js";
import { Course } from "../shared.types.js";
import { parse } from "date-fns";

export default class CourseServices {
	static async insertCourse(course: Course): Promise<void> {
		// Delete if already exists
		await pool.query('DELETE FROM course WHERE title = $1', [course.title]);
		// Insert course data
		const courseSql = 'INSERT INTO course(title, code) VALUES($1, $2) RETURNING id';
		const courseValues = [course.title, course.code];
		const courseRes = await pool.query(courseSql, courseValues);
		for (const offering of course.offerings) {
			const offeringSql = 'INSERT INTO offering(course_id) VALUES($1) RETURNING id';
			const offeringRes = await pool.query(offeringSql, [courseRes.rows[0].id]);
			for (const sectionType of offering) {
				const sectionTypeSql = 'INSERT INTO section_type(offering_id, name) VALUES($1, $2) RETURNING id';
				const sectionTypeValues = [offeringRes.rows[0].id, sectionType.name];
				const sectionTypeRes = await pool.query(sectionTypeSql, sectionTypeValues);
				for (const section of sectionType.sections) {
					const sectionSql = 'INSERT INTO section(section_type_id, crn, credits, "maxEnrollment", enrollment, "start", "end", "onMonday", "onTuesday", "onWednesday", "onThursday", "onFriday") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)';
					const startTime = `${section.start.getHours()}:${section.start.getMinutes()}`;
					const endTime = `${section.end.getHours()}:${section.end.getMinutes()}`;
					const sectionValues = [sectionTypeRes.rows[0].id, section.crn, section.credits, section.maxEnrollment, section.enrollment, startTime, endTime, section.onMonday, section.onTuesday, section.onWednesday, section.onThursday, section.onFriday];
					await pool.query(sectionSql, sectionValues);
					
				}
			}
		}
	}

	static async getCourse(id: number): Promise<Course> {
		const res = await pool.query(`
		SELECT JSONB_BUILD_OBJECT(
			'title', course_title,
			'code', course_code,
			'offerings', JSONB_AGG(course.offerings)) AS data
		FROM (
			SELECT 
				offering.course_title AS course_title,
				offering.course_code AS course_code,
				JSONB_AGG(JSONB_BUILD_OBJECT(
				'name', offering.name, 
				'sections', offering.sections)) AS offerings
			FROM (
				SELECT
					course.title AS course_title,
					course.code AS course_code,
					section_type.offering_id AS id, section_type.name AS name,
					JSONB_AGG(JSONB_BUILD_OBJECT(
						'crn', section.crn,
						'credits', section.credits,
						'maxEnrollment', section."maxEnrollment",
						'enrollment', section.enrollment,
						'start', section.start,
						'end', section.end,
						'onMonday', section."onMonday",
						'onTuesday', section."onTuesday",
						'onWednesday', section."onWednesday",
						'onThursday', section."onThursday",
						'onFriday', section."onFriday"
					)) AS sections
				FROM course
				INNER JOIN offering ON course.id = offering.course_id
				INNER JOIN section_type ON offering.id = section_type.offering_id
				INNER JOIN section ON section_type.id = section.section_type_id
				WHERE course.id = $1
				GROUP BY course.title, course_code, section_type.id
			) AS offering
			GROUP BY course_title, course_code, offering.id
		) AS course
		GROUP BY course_title, course_code
		`, [id]);
		res.rows[0].data.offerings.map((offering: any) => {
			offering.map((sectionType: any) => {
				sectionType.sections.map((section: any) => {
					section.start = parse(section.start, 'HH:mm:ss', new Date(0));
					section.end = parse(section.end, 'HH:mm:ss', new Date(0));
				})
			})
		});

		return res.rows[0].data;
	}
}
