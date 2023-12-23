import axios, { AxiosResponse } from "axios";
import { Course, TimeTable } from "../shared.types";

export default class RegistrationScraper {
    private cookies: string;

    public static async create(): Promise<RegistrationScraper> {
        const Scraper = new RegistrationScraper();
        await Scraper.getCookies();
        return Scraper;
    }

    public async getCookies(): Promise<void> {
        const data = {
            term: 202402
        }

        const selectTerm = await axios.post('https://prodapps.isadm.oregonstate.edu/StudentRegistrationSsb/ssb/term/search?mode=search', data, {
            headers: {'content-type': 'application/x-www-form-urlencoded'}
        });

        this.cookies = selectTerm.headers['set-cookie']?.join('; ') || '';
    }

    private normalizeTime(time: string): number {
        if (time.length != 4) { return 9999; }
        return parseInt(time.slice(0, 2)) * 60 + parseInt(time.slice(2, 4));
    }

    private normalizeCourseData(data: any): Array<Course> {
        let courses: Array<Course> = [];
        const badAttributes = ['HNRS'];

        data.forEach((course: any) => {
            if (course.sectionAttributes?.some((attribute: any) => badAttributes.includes(attribute.code))) {
                // remove bad attributes
            } else if (course.maxEnrollment < 10 || !course.meetingsFaculty) {
                // filter out exams
            } else if (!course.meetingsFaculty[0]?.meetingTime?.beginTime) {
                // filter no schedule
            } else {
                const timeTable: TimeTable = {
                    start: this.normalizeTime(course.meetingsFaculty[0].meetingTime.beginTime),
                    end: this.normalizeTime(course.meetingsFaculty[0].meetingTime.endTime),
                    days: [
                        course.meetingsFaculty[0].meetingTime.monday,
                        course.meetingsFaculty[0].meetingTime.tuesday,
                        course.meetingsFaculty[0].meetingTime.wednesday,
                        course.meetingsFaculty[0].meetingTime.thursday,
                        course.meetingsFaculty[0].meetingTime.friday
                    ]
                };
                courses.push({
                    crn: course.courseReferenceNumber,
                    title: course.courseTitle,
                    type: course.scheduleTypeDescription,
                    term: course.term,
                    campus: course.campusDescription,
                    credits: course.creditHours,
                    maxEnrollment: course.maximumEnrollment,
                    enrollment: course.enrollment,
                    linked: course.isSectionLinked,
                    linkIdentifier: course?.linkIdentifier,
                    instructorName: course.faculty[0]?.displayName || '',
                    instructorEmail: course.faculty[0]?.emailAddress || '',
                    timeTable: timeTable
                });
            }
        });

        return courses;
    }

    public async getCourses(title: string = ''): Promise<Array<Course>> {
        const res = await axios.get('https://prodapps.isadm.oregonstate.edu/StudentRegistrationSsb/ssb/searchResults/searchResults', {
            headers: {'Cookie': this.cookies},
            params: {
                txt_campus: 'C',
                txt_term: 202402,
                txt_courseTitle: title,
                pageOffset: 0,
                pageMaxSize: 500,
            }
        });

        let courses: Array<Course> = [];
        const badAttributes = ['HNRS'];

        return this.normalizeCourseData(res.data.data);
    }

    public async getLinked(crn: number | string): Promise<Array<Course>> {
        const res = await axios.get('https://prodapps.isadm.oregonstate.edu/StudentRegistrationSsb/ssb/searchResults/fetchLinkedSections', {
            headers: {'Cookie': this.cookies},
            params: {
                term: 202402,
                courseReferenceNumber: crn,
            }
        });

        return this.normalizeCourseData(res.data.linkedData.flat());
    }

    constructor() {
        this.cookies = '';
    }
}

