export type Catalog = Course[];

export interface Course {
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
    start: number,
    end: number,
    isMondayIncluded: boolean,
    isTuesdayIncluded: boolean,
    isThursdayIncluded: boolean,
    isWednesdayIncluded: boolean,
    isFridayIncluded: boolean
}
