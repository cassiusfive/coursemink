import axios from "axios";
import {
  Course,
  Offering,
  SectionType,
  Section,
  Professor,
  Timestamp,
} from "../shared.types";
import { DeepRequired } from "utility-types";
import pkg from "he";
const { decode } = pkg;

class RegistrationScraper {
  private axiosInstance = axios.create({
    baseURL:
      "https://prodapps.isadm.oregonstate.edu/StudentRegistrationSsb/ssb/",
    withCredentials: true,
  });

  private async setTerm(termCode: number | string): Promise<string> {
    const res = await this.axiosInstance.post(
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

  public async scrapeProfessors(): Promise<Professor[]> {
    let data = JSON.stringify({
      query: `query TeacherSearchPaginationQuery(
		$count: Int!
		$cursor: String
		$query: TeacherSearchQuery!
		) {
		search: newSearch {
			...TeacherSearchPagination_search_1jWD3d
		}
		}

		fragment TeacherSearchPagination_search_1jWD3d on newSearch {
		teachers(query: $query, first: $count, after: $cursor) {
			didFallback
			edges {
			cursor
			node {
				...TeacherCard_teacher
				id
				__typename
			}
			}
			pageInfo {
			hasNextPage
			endCursor
			}
			resultCount
			filters {
			field
			options {
				value
				id
			}
			}
		}
		}

		fragment TeacherCard_teacher on Teacher {
		id
		legacyId
		avgRating
		numRatings
		...CardFeedback_teacher
		...CardSchool_teacher
		...CardName_teacher
		...TeacherBookmark_teacher
		}

		fragment CardFeedback_teacher on Teacher {
		wouldTakeAgainPercent
		avgDifficulty
		}

		fragment CardSchool_teacher on Teacher {
		department
		school {
			name
			id
		}
		}

		fragment CardName_teacher on Teacher {
		firstName
		lastName
		}

		fragment TeacherBookmark_teacher on Teacher {
		id
		isSaved
		}`,
      variables: {
        count: 9999,
        cursor: "VGVhY2hlci0xMjc4",
        query: {
          text: "",
          schoolID: "U2Nob29sLTc0Mg==",
          fallback: true,
          departmentID: null,
        },
      },
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://www.ratemyprofessors.com/graphql",
      headers: {
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        Authorization: "Basic dGVzdDp0ZXN0",
        Connection: "keep-alive",
        "Content-Type": "application/json",
        Cookie: "ccpa-notice-viewed-02=true;",
        DNT: "1",
        Origin: "https://www.ratemyprofessors.com",
        Referer: "https://www.ratemyprofessors.com/search/professors/742?q=*",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
      },
      data: data,
    };

    const res = await axios.request(config);
    const profs: Professor[] = res.data.data.search.teachers.edges.map(
      (edge: any) => {
        return {
          name:
            edge.node.firstName
              .replace(/\(([^)]+)\)|'([^']+)'|"([^"]+)"/, "")
              .trim() +
            " " +
            edge.node.lastName,
          avgRating: edge.node.avgRating,
          avgDifficulty: edge.node.avgDifficulty,
          numRatings: edge.node.numRatings,
        };
      },
    );
    return profs;
  }

  public async scrapeEmptyCourses(): Promise<Course[]> {
    const cookies = await this.setTerm(202501);

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

    console.log(courseSearch.data.data);

    return this.normalizeCourseData(
      courseSearch.data.data.filter((rawSection: any) => {
        return rawSection.courseTitle === title;
      }),
    );
  }

  private normalizeCourseData(data: any): Course {
    console.log(data);
    if (!data) {
      throw new Error("No data provided");
    }
    data = data.filter((rawSection: any) => {
      const excludedAttributes = ["HNRS"];
      const excludedTypes = ["Examination for Credit"];
      // if (rawSection?.faculty.length < 1) {
      //     return false;
      // }
      if (rawSection?.meetingsFaculty.length < 1) {
        return false;
      }
      if (
        rawSection.sectionAttributes?.some((attribute: any) =>
          excludedAttributes.includes(attribute.code),
        ) ||
        excludedTypes.includes(rawSection.scheduleTypeDescription)
      ) {
        return false;
      }
      return true;
    });

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

const scraper = new RegistrationScraper();
export default scraper;
