export interface Course {
    crn: number,
    title: string,
    type: string,
    term: string,
    campus: string,
    credits: number,
    maxEnrollment: number,
    enrollment: number,
    linked: boolean,
    linkIdentifier: string,
    instructorName: string,
    instructorEmail: string,
    timeTable: TimeTable
}

export interface TimeTable {
    start: number,
    end: number,
    days: boolean[]
    // M W T R F
}

export interface TimeRange {
    start: number,
    end: number
}