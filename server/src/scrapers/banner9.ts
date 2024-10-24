import { Course } from "../db/schema";
import axios, { AxiosInstance } from "axios";
import pkg from "he";
import db from "../db/database";
const { decode } = pkg;

type RawSection = {
  id: number;
  term: string;
  termDesc: string;
  courseReferenceNumber: string;
  partOfTerm: string;
  courseNumber: string;
  subject: string;
  subjectDescription: string;
  sequenceNumber: string;
  campusDescription: string;
  scheduleTypeDescription: string;
  courseTitle: string;
  creditHours: number;
  maximumEnrollment: number;
  enrollment: number;
  seatsAvailable: number;
  waitCapacity: number;
  waitCount: number;
  waitAvailable: number;
  crossList: null | string;
  crossListCapacity: null | number;
  crossListCount: null | number;
  crossListAvailable: null | number;
  creditHourHigh: number;
  creditHourLow: number;
  creditHourIndicator: string;
  openSection: boolean;
  linkIdentifier: null | string;
  isSectionLinked: boolean;
  subjectCourse: string;
  faculty: {
    bannerId: string;
    category: null | string;
    class: string;
    courseReferenceNumber: string;
    displayName: string;
    emailAddress: string;
    primaryIndicator: boolean;
    term: string;
  }[];
  meetingsFaculty: {
    category: string;
    class: string;
    courseReferenceNumber: string;
    faculty: any[];
    meetingTime: {
      beginTime: null | string;
      building: null | string;
      buildingDescription: null | string;
      campus: null | string;
      campusDescription: null | string;
      category: string;
      class: string;
      courseReferenceNumber: string;
      creditHourSession: number;
      endDate: string;
      endTime: null | string;
      friday: boolean;
      hoursWeek: number;
      meetingScheduleType: string;
      meetingType: string;
      meetingTypeDescription: string;
      monday: boolean;
      room: null | string;
      saturday: boolean;
      startDate: string;
      sunday: boolean;
      term: string;
      thursday: boolean;
      tuesday: boolean;
      wednesday: boolean;
    };
    term: string;
  }[];
  reservedSeatSummary: null | any;
  sectionAttributes: {
    class: string;
    code: string;
    courseReferenceNumber: string;
    description: string;
    isZTCAttribute: boolean;
    termCode: string;
  }[];
  instructionalMethod: null | string;
  instructionalMethodDescription: null | string;
};

type SearchParams = {
  txt_term: string;
  pageOffset: number;
  pageMaxSize: number;
  txt_campus?: string;
};

type SearchResult = {
  totalCount: number;
  sections: RawSection[];
};

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

  public async scrapeAllCourses(termCode: string): Promise<void> {
    const cookies = await this.setTerm(termCode);

    // let set: Set<String> = new Set();
    // let courseList: Course[] = [];

    const pageMax = 500;

    const initialSearch = await this.search(cookies, {
      txt_term: termCode,
      pageOffset: 0,
      pageMaxSize: 10,
    });

    const totalSections: number = initialSearch.totalCount;

    const pool: Promise<SearchResult>[] = [];
    for (let offset = 0; offset < totalSections; offset += pageMax) {
      pool.push(
        this.search(cookies, {
          txt_term: termCode,
          pageOffset: offset,
          pageMaxSize: pageMax,
        }),
      );
    }
    const results = await Promise.all(pool);
    const sections = results.flatMap((result) => result.sections);

    console.log(sections[0].faculty);

    await this.insertSections(sections);
  }

  private async search(
    cookies: string,
    params: SearchParams,
  ): Promise<SearchResult> {
    const res = await this.apiClient.get("searchResults/searchResults", {
      params: params,
      headers: { Cookie: cookies },
    });
    return {
      totalCount: res.data.totalCount,
      sections: res.data.data,
    };
  }

  private async insertSections(sections: RawSection[]) {
    const constructor: Record<string, string> = {};
  }

  //   public async scrapeCourse(code: string, title: string): Promise<Course> {
  //     const cookies = await this.setTerm("344");

  //     const [subjectCode, courseNumber] = code
  //       .split(/([a-zA-Z]+)([0-9]+.+)/)
  //       .filter(Boolean);

  //     const courseSearch = await this.apiClient.get(
  //       "searchResults/searchResults",
  //       {
  //         params: {
  //           txt_campus: "C",
  //           txt_term: 202501,
  //           txt_subject: subjectCode,
  //           txt_courseNumber: courseNumber,
  //           pageOffset: 0,
  //           pageMaxSize: 500,
  //         },
  //         headers: {
  //           Cookie: cookies,
  //         },
  //       },
  //     );

  //     return this.normalizeCourseData(
  //       courseSearch.data.data.filter((rawSection: any) => {
  //         return rawSection.courseTitle === title;
  //       }),
  //     );
  //   }
  // private normalizeCourse(data: any): Course {
  //   const course: Course = {
  //     title: decode(data[0].courseTitle),
  //     code: data[0].subject + data[0].courseNumber,
  //     offerings: [],
  //   };

  //   const linkedGroups: Record<string, Record<string, Section[]>> = {};

  //   for (const section of data) {
  //     const linker = this.extractLink(section?.linkIdentifier);
  //     if (!linkedGroups[linker]) {
  //       linkedGroups[linker] = {};
  //     }
  //     if (!linkedGroups[linker][section.scheduleTypeDescription]) {
  //       linkedGroups[linker][section.scheduleTypeDescription] = [];
  //     }
  //     const meetInfo = section.meetingsFaculty[0].meetingTime;
  //     const instructorName =
  //       section.faculty.length > 0
  //         ? this.normalizeName(
  //             section.faculty.find((faculty: any) => faculty.primaryIndicator)
  //               .displayName,
  //           )
  //         : "Staff";

  //     linkedGroups[linker][section.scheduleTypeDescription].push({
  //       crn: section.courseReferenceNumber,
  //       sectionNum: section.sequenceNumber,
  //       maxEnrollment: section.maximumEnrollment,
  //       currentEnrollment: section.enrollment,
  //       maxWaitlist: section.waitCapacity,
  //       currentWaitlist: section.waitCount,
  //       start: this.parseTime(meetInfo.beginTime),
  //       end: this.parseTime(meetInfo.endTime),
  //       onMonday: meetInfo.monday,
  //       onTuesday: meetInfo.tuesday,
  //       onWednesday: meetInfo.wednesday,
  //       onThursday: meetInfo.thursday,
  //       onFriday: meetInfo.friday,
  //       location: meetInfo.buildingDescription + " " + meetInfo.room,
  //       professor: {
  //         name: instructorName,
  //       },
  //     });
  //   }

  //   for (const linker in linkedGroups) {
  //     const offering: Section[] = [];
  //     for (const type in linkedGroups[linker]) {
  //       offering.push({
  //         name: type,
  //         sections: linkedGroups[linker][type],
  //       });
  //     }
  //     if (course.offerings) {
  //       course.offerings.push(offering);
  //     }
  //   }

  //   return course;
  // }

  private aggregateCourses(sections: RawSection[]): Course[] {
    await db.query("");
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

export default Banner9Scraper;
