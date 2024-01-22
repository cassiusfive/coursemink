import axios from "axios";
import { CourseCatalog, Course, Offering, SectionType, Section } from "../shared.types";

import { parse } from "date-fns";

class RegistrationScraper {
    private axiosInstance = axios.create({
        baseURL: 'https://prodapps.isadm.oregonstate.edu/StudentRegistrationSsb/ssb/',
        withCredentials: true,
    });

	private async setTerm(termCode: number | string): Promise<string> {
		const res = await this.axiosInstance.post('term/search?mode=search', { term: 202402 }, {
            headers: {'content-type': 'application/x-www-form-urlencoded'},
        });
		return res.headers['set-cookie']?.join('; ') || '';
	}

	public async scrapeEmptyCourses(): Promise<Course[]> {
		const cookies = await this.setTerm(202402);

		let set: Set<String> = new Set();
		let courseList: Course[] = [];

		const initialSearch = await this.axiosInstance.get('searchResults/searchResults', {
            params: {
                txt_campus: 'C',
                txt_term: 202402,
                pageOffset: 0,
                pageMaxSize: 500,
            },
            headers: {
                Cookie: cookies
            }
        });

		let coursesSearched = 500;
		const totalCourses: number = initialSearch.data.totalCount;

		initialSearch.data.data.forEach((courseData: any) => {
			const course: Course = {
				title: courseData.courseTitle,
				code: courseData.subjectCourse,
				offerings: []
			}
			if (!set.has(course.code + course.title)) {
				courseList.push(course)
			}
			set.add(course.code + course.title);
		});

		while (coursesSearched < totalCourses) {
			const search = await this.axiosInstance.get('searchResults/searchResults', {
				params: {
					txt_campus: 'C',
					txt_term: 202402,
					pageOffset: coursesSearched,
					pageMaxSize: 500,
				},
				headers: {
					Cookie: cookies
				}
			});
			coursesSearched += 500;

			search.data.data.forEach((courseData: any) => {
				const course: Course = {
					title: courseData.courseTitle,
					code: courseData.subjectCourse,
					offerings: []
				}
				if (!set.has(course.code + course.title)) {
					courseList.push(course)
				}
				set.add(course.code + course.title);
			});
		}

		return courseList;
	}

    public async scrapeCourse(title: string): Promise<Course> {
		const cookies = await this.setTerm(202402);

        const courseSearch = await this.axiosInstance.get('searchResults/searchResults', {
            params: {
                txt_campus: 'C',
                txt_term: 202402,
                txt_courseTitle: title,
                pageOffset: 0,
                pageMaxSize: 500,
            },
            headers: {
                Cookie: cookies
            }
        });

        return this.normalizeCourseData(courseSearch.data.data);
    }

    private normalizeCourseData(data: any): Course {
        if (!data) { throw new Error("No data provided") }
        data = data.filter((rawSection: any) => {
            const excludedAttributes = ['HNRS'];
            if (rawSection?.faculty.length != 1) {
                return false;
            }
            if (rawSection?.meetingsFaculty.length != 1 ) {
                return false;
            }
            if (rawSection.sectionAttributes?.some((attribute: any) => excludedAttributes.includes(attribute.code))) {
                return false;
            }
            return true;
        });

        if (data.length == 0) { throw new Error("Course data not normalized") }

        const course: Course = {
            title: data[0].courseTitle,
            code: data[0].subject + ' ' + data[0].courseNumber,
            offerings: [],
        };

        const linkedGroups: Record<string, Record<string, Section[]>> = {};

        for (const section of data) {
            const linker = this.extractLink(section?.linkIdentifier);
            if (!linkedGroups[linker]) {
                linkedGroups[linker] = {};
            }
            if (!linkedGroups[linker][section.scheduleTypeDescription]) {
                linkedGroups[linker][section.scheduleTypeDescription] = [];
            }
            linkedGroups[linker][section.scheduleTypeDescription].push({
                crn: section.courseReferenceNumber,
                credits: section.creditHours,
                maxEnrollment: section.maximumEnrollment,
                enrollment: section.enrollment,
                instructorName: section.faculty[0].displayName,
                instructorEmail: section.faculty[0].emailAddress,
                start: parse(section.meetingsFaculty[0].meetingTime.beginTime, 'HHmm', new Date(0)),
                end: parse(section.meetingsFaculty[0].meetingTime.endTime, 'HHmm', new Date(0)),
                onMonday: section.meetingsFaculty[0].meetingTime.monday,
                onTuesday: section.meetingsFaculty[0].meetingTime.tuesday,
                onWednesday: section.meetingsFaculty[0].meetingTime.thursday,
                onThursday: section.meetingsFaculty[0].meetingTime.wednesday,
                onFriday: section.meetingsFaculty[0].meetingTime.friday
            });
        }

        for (const linker in linkedGroups) {
            const offering: Offering = [];
            for (const type in linkedGroups[linker]) {
                offering.push({
                    name: type,
                    sections: linkedGroups[linker][type]
                });
            }
            course.offerings.push(offering);
        }

        return course;
    }

    private extractLink(linkIdentifier: string | undefined) {
        if (!linkIdentifier) {return 'NONE'}
        return linkIdentifier.replace(/[^a-zA-Z]/g, '');
    }

}

const scraper = new RegistrationScraper();
export default scraper;