import pool from "../utils/database.js";
import scraper from "./scraper.js";
import ProfServices from "./profServices.js";
import { Course, Professor, Timestamp } from "../shared.types.js";
import { DeepRequired } from "utility-types";

type CourseInfo = {
    id: number;
    title: string;
    code: string;
    updated_at: Date;
};

export default class CourseServices {
    static async insertCourse(
        course: Course,
        courseId?: number
    ): Promise<void> {
        const now = new Date();
        if (courseId) {
            const courseSql = "UPDATE course SET updated_at = $2 WHERE id = $1";
            const courseValues = [courseId, now];
            await pool.query(courseSql, courseValues);
            await pool.query("DELETE FROM offering WHERE course_id = $1", [
                courseId,
            ]);
        } else {
            const courseSql =
                "INSERT INTO course(title, code, updated_at) VALUES($1, $2, $3) RETURNING id";
            const courseValues = [course.title, course.code, now];
            const courseRes = await pool.query(courseSql, courseValues);
            courseId = courseRes.rows[0].id;
        }
        for (const offering of course.offerings || []) {
            const offeringSql =
                "INSERT INTO offering(course_id) VALUES($1) RETURNING id";
            const offeringRes = await pool.query(offeringSql, [courseId]);
            for (const sectionType of offering) {
                const sectionTypeSql =
                    "INSERT INTO section_type(offering_id, name) VALUES($1, $2) RETURNING id";
                const sectionTypeValues = [
                    offeringRes.rows[0].id,
                    sectionType.name,
                ];
                const sectionTypeRes = await pool.query(
                    sectionTypeSql,
                    sectionTypeValues
                );
                for (const section of sectionType.sections) {
                    const nameFuzzyRes = await pool.query(
                        "SELECT id, name FROM professor WHERE SIMILARITY(name, $1) > 0.6 ORDER BY SIMILARITY(name, $1) DESC LIMIT 1",
                        [section.professor.name]
                    );
                    let professorId = nameFuzzyRes.rows[0]?.id;
                    if (professorId == null) {
                        professorId = await ProfServices.insertProf({
                            name: section.professor.name,
                            avgRating: 0,
                            avgDifficulty: 0,
                            numRatings: 0,
                        });
                    }
                    const sectionSql = `INSERT INTO section(section_type_id, crn, section_num, current_enrollment, max_enrollment, current_waitlist, max_waitlist, location, start_time, end_time, on_monday, on_tuesday, on_wednesday, on_thursday, on_friday, professor_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`;
                    const startTime = `${section.start.hours}:${section.start.minutes}`;
                    const endTime = `${section.end.hours}:${section.end.minutes}`;
                    const sectionValues = [
                        sectionTypeRes.rows[0].id,
                        section.crn,
                        section.sectionNum,
                        section.currentEnrollment,
                        section.maxEnrollment,
                        section.currentWaitlist,
                        section.maxWaitlist,
                        section.location,
                        startTime,
                        endTime,
                        section.onMonday,
                        section.onTuesday,
                        section.onWednesday,
                        section.onThursday,
                        section.onFriday,
                        professorId,
                    ];
                    await pool.query(sectionSql, sectionValues);
                }
            }
        }
    }

    static async getCourses(): Promise<Course[]> {
        const res = await pool.query(`
		SELECT id, title, code FROM course
		`);
        return res.rows;
    }

    static async getCourseInfo(id: number): Promise<CourseInfo> {
        const res = await pool.query(
            `
		SELECT JSONB_BUILD_OBJECT(
			'title', title,
			'code', code,
			'updated_at', updated_at) AS data
		FROM course
		WHERE id = $1
		`,
            [id]
        );
        const timestamp: Date = new Date(res.rows[0].data.updated_at);
        res.rows[0].data.updated_at = timestamp;
        return res.rows[0].data;
    }

    static async getCourse(id: number): Promise<DeepRequired<Course>> {
        const courseInfo = await CourseServices.getCourseInfo(id);
        const now = new Date();
        // 360000
        if (now.getTime() - courseInfo.updated_at.getTime() > 360000) {
            const course = await scraper.scrapeCourse(
                courseInfo.code,
                courseInfo.title
            );
            await CourseServices.insertCourse(course, id);
        }
        const res = await pool.query(
            `
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
						'id', section.id,
						'crn', section.crn,
						'sectionNum', section.section_num,
						'currentEnrollment', section.current_enrollment,
						'maxEnrollment', section.max_enrollment,
						'currentWaitlist', section.current_waitlist,
						'maxWaitlist', section.max_waitlist,
						'location', section.location,
						'start', section.start_time,
						'end', section.end_time,
						'onMonday', section.on_monday,
						'onTuesday', section.on_tuesday,
						'onWednesday', section.on_wednesday,
						'onThursday', section.on_thursday,
						'onFriday', section.on_friday,
						'professor', JSONB_BUILD_OBJECT(
							'name', professor.name,
							'avgRating', professor.avg_rating,
							'avgDifficulty', professor.avg_difficulty,
							'numRatings', professor.num_ratings
						)
					)) AS sections
				FROM course
				INNER JOIN offering ON course.id = offering.course_id
				INNER JOIN section_type ON offering.id = section_type.offering_id
				INNER JOIN section ON section_type.id = section.section_type_id
				INNER JOIN professor ON section.professor_id = professor.id
				WHERE course.id = $1
				GROUP BY course.title, course_code, section_type.id
			) AS offering
			GROUP BY course_title, course_code, offering.id
		) AS course
		GROUP BY course_title, course_code
		`,
            [id]
        );
        res.rows[0].data.offerings.map((offering: any) => {
            offering.map((sectionType: any) => {
                sectionType.sections.map((section: any) => {
                    section.start = this.parseStamp(section.start);
                    section.end = this.parseStamp(section.end);
                });
            });
        });
        res.rows[0].data["id"] = id;
        return res.rows[0].data;
    }

    private static parseStamp(time: string): Timestamp {
        const [hours, minutes, seconds] = time.split(":");
        return { hours: +hours, minutes: +minutes };
    }
}
