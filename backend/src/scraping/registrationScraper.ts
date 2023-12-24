import axios, {AxiosInstance} from "axios";
import { Catalog, Course, Offering, SectionType, Section } from "../shared.types";

export default class RegistrationScraper {
    private axiosInstance = axios.create({ withCredentials: true });

    public async scrapeCourse(title: string): Promise<Course> {
        await axios.post('https://prodapps.isadm.oregonstate.edu/StudentRegistrationSsb/ssb/term/search?mode=search', { term: 202402 }, {
            headers: {'content-type': 'application/x-www-form-urlencoded'}
        });

        const res = await this.axiosInstance.get('https://prodapps.isadm.oregonstate.edu/StudentRegistrationSsb/ssb/searchResults/searchResults', {
            params: {
                txt_campus: 'C',
                txt_term: 202402,
                txt_courseTitle: title,
                pageOffset: 0,
                pageMaxSize: 500,
            }
        });

        return this.normalizeCourseData(res.data.data);
    }

    private normalizeCourseData(data: any): Course {
        data.filter((rawSection: any) => {
            if (rawSection?.faculty != 1) {
                return false;
            }
            if (rawSection?.meetingsFaculty.length != 1 ) {
                return false;
            }
            return true;
        });

        if (!data) { throw new Error("No data provided") }

        const course: Course = {
            title: data[0].courseTitle,
            code: data[0].subject + ' ' + data[0].courseNumber,
            offerings: [],
        };

        const linkedGroups: Record<string, Record<string, Section[]>> = {};

        for (const section of data) {
            const linker = this.extractLink(section?.linkIdentifier) || 'Z'
            if (!linkedGroups[linker]) {
                linkedGroups[linker] = {};
            }
            if (!linkedGroups[linker][section.meetingScheduleType]) {
                linkedGroups[linker][section.meetingScheduleType] = [];
            }
            linkedGroups[linker][section.meetingScheduleType].push({
                crn: section.courseReferenceNumber,
                credits: section.creditHours,
                maxEnrollment: section.maximumEnrollment,
                enrollment: section.enrollment,
                instructorName: section.faculty[0].displayName,
                instructorEmail: section.faculty[0].emailAddress,
                start: this.normalizeTime(section.meetingsFaculty[0].beginTime),
                end: this.normalizeTime(section.meetingsFaculty[0].endTime),
                isMondayIncluded: section.meetingsFaculty[0].monday,
                isTuesdayIncluded: section.meetingsFaculty[0].tuesday,
                isThursdayIncluded: section.meetingsFaculty[0].thursday,
                isWednesdayIncluded: section.meetingsFaculty[0].wednesday,
                isFridayIncluded: section.meetingsFaculty[0].friday
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

    private extractLink(linkIdentifier: string) {
        return linkIdentifier.replace(/[^a-zA-Z]/g, '');
    }

    private normalizeTime(time: string): number {
        if (time.length != 4) { return 9999; }
        return parseInt(time.slice(0, 2)) * 60 + parseInt(time.slice(2, 4));
    }

}