export type CourseCatalog = Course[];

export interface Course {
	id: number,
    title: string,
    code: string,
    offerings: Offering[]
};

export type Offering = SectionType[];

export interface SectionType {
    name: string,
    sections: Section[]
};

export interface Section {
    crn: number,
    credits: number,
    maxEnrollment: number,
    enrollment: number,
    instructorName: string,
    instructorEmail: string,
    schedule: TimeRange,
    isMondayIncluded: boolean,
    isTuesdayIncluded: boolean,
    isThursdayIncluded: boolean,
    isWednesdayIncluded: boolean,
    isFridayIncluded: boolean
};

export interface TimeRange {
    start: number,
    end: number
};