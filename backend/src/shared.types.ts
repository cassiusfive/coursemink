export interface Course {
    id: number;
    title: string;
    code: string;
    offerings: Offering[];
}

export type Offering = SectionType[];

export interface SectionType {
    name: string;
    sections: Section[];
}

export interface Section {
    crn: number;
    credits: number;
    maxEnrollment: number;
    enrollment: number;
    instructorName?: string;
    instructorAvgRating?: number;
    instructorAvgDifficulty?: number;
    instructorRatings?: number;
    start: Date;
    end: Date;
    onMonday: boolean;
    onTuesday: boolean;
    onWednesday: boolean;
    onThursday: boolean;
    onFriday: boolean;
}

export interface TimeRange {
    start: Date;
    end: Date;
}

export interface Professor {
    name: string;
    email: string;
    avg_rating: number;
    avg_difficulty: number;
    num_ratings: number;
}
