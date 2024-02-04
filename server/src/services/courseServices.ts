import { Professor } from "./../shared.types";
import pool from "../utils/database.js";
import scraper from "./scraper.js";
import ProfServices from "./profServices.js";
import { Course, Timestamp } from "../shared.types.js";

interface CourseInfo {
    id: number;
    title: string;
    code: string;
    updated_at: Date;
}

export default class CourseServices {
    static async insertCourse(
        course: Partial<Course>,
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
                        [section.instructorName]
                    );
                    let professorId = nameFuzzyRes.rows[0]?.id;
                    if (professorId == null) {
                        professorId = await ProfServices.insertProf({
                            name: section.instructorName,
                            avg_rating: 0,
                            avg_difficulty: 0,
                            num_ratings: 0,
                        });
                    }
                    const sectionSql =
                        'INSERT INTO section(section_type_id, crn, credits, "maxEnrollment", professor_id, enrollment, "start", "end", "onMonday", "onTuesday", "onWednesday", "onThursday", "onFriday") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)';
                    const startTime = `${section.start.hours}:${section.start.minutes}`;
                    const endTime = `${section.end.hours}:${section.end.minutes}`;
                    const sectionValues = [
                        sectionTypeRes.rows[0].id,
                        section.crn,
                        section.credits,
                        section.maxEnrollment,
                        professorId,
                        section.enrollment,
                        startTime,
                        endTime,
                        section.onMonday,
                        section.onTuesday,
                        section.onWednesday,
                        section.onThursday,
                        section.onFriday,
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

    static async getCourse(id: number): Promise<Course> {
        const courseInfo = await CourseServices.getCourseInfo(id);
        const now = new Date();
        // 360000
        if (now.getTime() - courseInfo.updated_at.getTime() > 0) {
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
						'crn', section.crn,
						'credits', section.credits,
						'instructorName', professor.name,
						'instructorAvgRating', professor.avg_rating,
						'instructorAvgDifficulty', professor.avg_difficulty,
						'instructorRatings', professor.num_ratings,
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
