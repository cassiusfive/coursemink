import { Course } from "../db/schema";
import axios, { AxiosInstance } from "axios";
import pkg from "he";
const { decode } = pkg;

class Banner9Scraper {
  apiClient: AxiosInstance;

  constructor(url: string) {
    this.apiClient = axios.create({
      baseURL: url,
    });
  }

  private async setTerm(termCode: string): Promise<string> {
    const res = await this.apiClient.post(
      "term/search?mode=search",
      { term: termCode },
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      },
    );
    return res.headers["set-cookie"]?.join("; ") || "";
  }

  public async scrapeAllCourses(termCode: string): Promise<Course[]> {
    const cookies = await this.setTerm(termCode);

    let set: Set<String> = new Set();
    let courseList: Course[] = [];

    const initialSearch = await this.axiosInstance.get(
      "searchResults/searchResults",
      {
        params: {
          txt_campus: "C",
          txt_term: 202501,
          pageOffset: 0,
          pageMaxSize: 500,
        },
        headers: {
          Cookie: cookies,
        },
      },
    );

    let coursesSearched = 500;
    const totalCourses: number = initialSearch.data.totalCount;

    initialSearch.data.data.forEach((courseData: any) => {
      const course: Course = {
        title: decode(courseData.courseTitle),
        code: courseData.subjectCourse,
        offerings: [],
      };
      if (!set.has(course.code || "" + course.title || "")) {
        courseList.push(course);
      }
      set.add(course.code || "" + course.title || "");
    });

    while (coursesSearched < totalCourses) {
      const search = await this.axiosInstance.get(
        "searchResults/searchResults",
        {
          params: {
            txt_campus: "C",
            txt_term: 202501,
            pageOffset: coursesSearched,
            pageMaxSize: 500,
          },
          headers: {
            Cookie: cookies,
          },
        },
      );
      coursesSearched += 500;

      search.data.data.forEach((courseData: any) => {
        const course: Course = {
          title: decode(courseData.courseTitle),
          code: courseData.subjectCourse,
          offerings: [],
        };
        if (!set.has(course.code || "" + course.title || "")) {
          courseList.push(course);
        }
        set.add(course.code || "" + course.title || "");
      });
    }

    return courseList;
  }

  public async scrapeCourse(code: string, title: string): Promise<Course> {
    const cookies = await this.setTerm(202501);

    const [subjectCode, courseNumber] = code
      .split(/([a-zA-Z]+)([0-9]+.+)/)
      .filter(Boolean);

    const courseSearch = await this.axiosInstance.get(
      "searchResults/searchResults",
      {
        params: {
          txt_campus: "C",
          txt_term: 202501,
          txt_subject: subjectCode,
          txt_courseNumber: courseNumber,
          pageOffset: 0,
          pageMaxSize: 500,
        },
        headers: {
          Cookie: cookies,
        },
      },
    );

    return this.normalizeCourseData(
      courseSearch.data.data.filter((rawSection: any) => {
        return rawSection.courseTitle === title;
      }),
    );
  }

  private normalizeCourseData(data: any): Course {
    if (!data) {
      throw new Error("No data provided");
    }

    if (data.length == 0) {
      throw new Error("Course has no valid offerings");
    }

    const course: Course = {
      title: decode(data[0].courseTitle),
      code: data[0].subject + data[0].courseNumber,
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
      const meetInfo = section.meetingsFaculty[0].meetingTime;
      const instructorName =
        section.faculty.length > 0
          ? this.normalizeName(
              section.faculty.find((faculty: any) => faculty.primaryIndicator)
                .displayName,
            )
          : "Staff";

      linkedGroups[linker][section.scheduleTypeDescription].push({
        crn: section.courseReferenceNumber,
        sectionNum: section.sequenceNumber,
        maxEnrollment: section.maximumEnrollment,
        currentEnrollment: section.enrollment,
        maxWaitlist: section.waitCapacity,
        currentWaitlist: section.waitCount,
        start: this.parseTime(meetInfo.beginTime),
        end: this.parseTime(meetInfo.endTime),
        onMonday: meetInfo.monday,
        onTuesday: meetInfo.tuesday,
        onWednesday: meetInfo.wednesday,
        onThursday: meetInfo.thursday,
        onFriday: meetInfo.friday,
        location: meetInfo.buildingDescription + " " + meetInfo.room,
        professor: {
          name: instructorName,
        },
      });
    }

    for (const linker in linkedGroups) {
      const offering: SectionType[] = [];
      for (const type in linkedGroups[linker]) {
        offering.push({
          name: type,
          sections: linkedGroups[linker][type],
        });
      }
      if (course.offerings) {
        course.offerings.push(offering);
      }
    }

    return course;
  }

  private parseTime(time: string): Timestamp {
    if (time.length != 4) return { hours: 0, minutes: 0 };
    return {
      hours: +time.slice(0, 2),
      minutes: +time.slice(2, 4),
    };
  }

  private normalizeName(name: string) {
    const [last, first] = name.split(", ");
    return first + " " + last.split(" ")[0];
  }

  private extractLink(linkIdentifier: string | undefined) {
    if (!linkIdentifier) {
      return "NONE";
    }
    return linkIdentifier.replace(/[^a-zA-Z]/g, "");
  }
}
