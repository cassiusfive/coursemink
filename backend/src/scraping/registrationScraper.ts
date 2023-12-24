import axios from "axios";
import { CourseCatalog, Course, Offering, SectionType, Section } from "../shared.types";

export default class RegistrationScraper {
    private axiosInstance = axios.create({
        baseURL: 'https://prodapps.isadm.oregonstate.edu/StudentRegistrationSsb/ssb/',
        withCredentials: true,
    });

    public async scrapeCourse(title: string): Promise<Course> {
        const setTerm = await this.axiosInstance.post('term/search?mode=search', { term: 202402 }, {
            headers: {'content-type': 'application/x-www-form-urlencoded'},
        });

        const cookies = setTerm.headers['set-cookie']?.join('; ') || '';

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
                schedule: {
                    start: this.normalizeTime(section.meetingsFaculty[0].meetingTime.beginTime),
                    end: this.normalizeTime(section.meetingsFaculty[0].meetingTime.endTime),
                },
                isMondayIncluded: section.meetingsFaculty[0].meetingTime.monday,
                isTuesdayIncluded: section.meetingsFaculty[0].meetingTime.tuesday,
                isThursdayIncluded: section.meetingsFaculty[0].meetingTime.thursday,
                isWednesdayIncluded: section.meetingsFaculty[0].meetingTime.wednesday,
                isFridayIncluded: section.meetingsFaculty[0].meetingTime.friday
            })
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

    private normalizeTime(time: string): number {
        if (time.length != 4) { return 9999; }
        return parseInt(time.slice(0, 2)) * 60 + parseInt(time.slice(2, 4));
    }

}