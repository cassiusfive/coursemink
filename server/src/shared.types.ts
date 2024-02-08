export type Course = {
    id?: number;
    title: string;
    code: string;
    offerings: Offering[];
};

export type Offering = SectionType[];

export type SectionType = {
    name: string;
    sections: Section[];
};

export type Timestamp = {
    hours: number;
    minutes: number;
};

export type TimeRange = {
    start: Timestamp;
    end: Timestamp;
};

export type Professor = {
    name: string;
    avg_rating?: number;
    avg_difficulty?: number;
    num_ratings?: number;
};

export type Section = {
    id?: number;
    crn: number;
    sectionNum: string;
    start: Timestamp;
    end: Timestamp;
    onMonday: boolean;
    onTuesday: boolean;
    onWednesday: boolean;
    onThursday: boolean;
    onFriday: boolean;
    location: string;
    currentEnrollment: number;
    maxEnrollment: number;
    currentWaitlist: number;
    maxWaitlist: number;
    professor: Professor;
};
