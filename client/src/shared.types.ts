export type Course = {
    id: number;
    title: string;
    code: string;
};

export type Professor = {
    name: string;
    avgRating: number;
    avgDifficulty: number;
    numRatings: number;
};

export type Section = {
    id: number;
    crn: string;
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
    courseId: number;
    type: string;
};

export type ProfessorDetails = {
    name: string;
    averageRating: number;
};

export type Timestamp = {
    hours: number;
    minutes: number;
};

export type TimeRange = {
    start: Timestamp;
    end: Timestamp;
};
