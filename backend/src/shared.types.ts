export type CourseCatalog = Course[];

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
    start: Date,
	end: Date,
    onMonday: boolean,
    onTuesday: boolean,
    onWednesday: boolean,
    onThursday: boolean,
    onFriday: boolean
};

export interface TimeRange {
    start: Date,
    end: Date
};