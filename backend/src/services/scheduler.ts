import {
    Course,
    Offering,
    Section,
    TimeRange,
    Timestamp,
} from "../shared.types";

type SectionEvent = {
    crn: number;
    courseId: number;
    courseCode: string;
    courseTitle: string;
    type: string;
    professor: string;
    professorAvgRating: number;
    timerange: string;
    start: number;
    length: number;
};

type Schedule = Fitness & {
    monday: SectionEvent[];
    tuesday: SectionEvent[];
    wednesday: SectionEvent[];
    thursday: SectionEvent[];
    friday: SectionEvent[];
};

type SchedulerWeights = {
    // Hard constraints
    overlapPenalty: number;

    // Soft constraints
    preferredStartTime: Timestamp;
    preferredEndTime: Timestamp;
    timePreferencePenalty: number;
    timeCohesionPenalty: number;
    timeDispersionPenalty: number;
    teacherRatingWeight: number;
};

type Fitness = {
    professorScore: number;
    overlapPenalty: number;
    timePreferencePenalty: number;
};

type ScoredSections = Fitness & {
    sections: Section[];
};

export class Scheduler {
    public static defaultWeights: SchedulerWeights = {
        overlapPenalty: -500, // Filter schedule defects

        preferredStartTime: { hours: 10, minutes: 0 }, // 10:00am
        preferredEndTime: { hours: 14, minutes: 0 }, // 4:00pm
        timePreferencePenalty: -50,

        timeCohesionPenalty: 0, // Minimize time between first and last class (per minute delta)
        timeDispersionPenalty: 0, // Minimize differences in class time (per minute delta)

        teacherRatingWeight: 10,
    };

    public static findSchedules(
        catalog: Course[],
        options?: Partial<SchedulerWeights>
    ): Schedule[] {
        const config = { ...this.defaultWeights, ...(options || {}) };
        const queue: ScoredSections[] = [];

        for (const possibleSchedule of this.generateCourseSections(catalog)) {
            queue.push({
                sections: possibleSchedule,
                ...this.evaluateFitness(possibleSchedule, config),
            });
        }

        const crnToEvent: Record<string, SectionEvent> = {};
        catalog.forEach((course) => {
            course.offerings.forEach((offering) => {
                offering.forEach((sectionType) => {
                    sectionType.sections.forEach((section) => {
                        crnToEvent[section.crn] = {
                            crn: section.crn,
                            courseId: course.id,
                            courseCode: course.code,
                            courseTitle: course.title,
                            type: sectionType.name,
                            timerange: this.stampsToRange(
                                section.start,
                                section.end
                            ),
                            start: section.start.hours,
                            length:
                                (this.stampValue(section.end) -
                                    this.stampValue(section.start)) /
                                60,
                            professor: section.instructorName || "Staff",
                            professorAvgRating:
                                section.instructorAvgRating || 2.5,
                        };
                    });
                });
            });
        });

        const schedules = queue
            .sort((a, b) => {
                return (
                    b.professorScore +
                    b.overlapPenalty +
                    b.timePreferencePenalty -
                    (a.professorScore +
                        a.overlapPenalty +
                        a.timePreferencePenalty)
                );
            })
            .slice(0, 200)
            .map((scoredSections) => {
                const schedule: Schedule = {
                    monday: [],
                    tuesday: [],
                    wednesday: [],
                    thursday: [],
                    friday: [],
                    ...scoredSections,
                };
                scoredSections.sections.forEach((section) => {
                    if (section.onMonday)
                        schedule.monday.push(crnToEvent[section.crn]);
                    if (section.onTuesday)
                        schedule.tuesday.push(crnToEvent[section.crn]);
                    if (section.onWednesday)
                        schedule.wednesday.push(crnToEvent[section.crn]);
                    if (section.onThursday)
                        schedule.thursday.push(crnToEvent[section.crn]);
                    if (section.onFriday)
                        schedule.friday.push(crnToEvent[section.crn]);
                });
                return schedule;
            });

        return schedules;
    }

    private static evaluateFitness(
        schedule: Section[],
        config: SchedulerWeights
    ): Fitness {
        let fitness: Fitness = {
            professorScore: 0,
            overlapPenalty: 0,
            timePreferencePenalty: 0,
        };

        let daySchedules: TimeRange[][] = [[], [], [], [], []];

        const sectionMemo: Record<string, number> = {};
        for (const section of schedule) {
            if (sectionMemo[section.crn]) {
                fitness.professorScore += sectionMemo[section.crn];
            } else {
                const sectionFitness = this.sectionFitness(section, config);
                sectionMemo[section.crn] = sectionFitness;
                fitness.professorScore += sectionFitness;
            }
            const timeRange: TimeRange = {
                start: section.start,
                end: section.end,
            };
            if (section.onMonday) {
                daySchedules[0].push(timeRange);
            }
            if (section.onTuesday) {
                daySchedules[1].push(timeRange);
            }
            if (section.onWednesday) {
                daySchedules[2].push(timeRange);
            }
            if (section.onThursday) {
                daySchedules[3].push(timeRange);
            }
            if (section.onFriday) {
                daySchedules[4].push(timeRange);
            }
        }

        fitness.overlapPenalty =
            this.dayFitness(daySchedules[0]) +
            this.dayFitness(daySchedules[1]) +
            this.dayFitness(daySchedules[2]) +
            this.dayFitness(daySchedules[3]) +
            this.dayFitness(daySchedules[4]);

        for (const daySchedule of daySchedules) {
            daySchedule.push({
                start: { hours: 0, minutes: 0 },
                end: config.preferredStartTime,
            });
            daySchedule.push({
                start: config.preferredEndTime,
                end: { hours: 24, minutes: 0 },
            });
        }

        fitness.timePreferencePenalty =
            this.dayFitness(daySchedules[0]) +
            this.dayFitness(daySchedules[1]) +
            this.dayFitness(daySchedules[2]) +
            this.dayFitness(daySchedules[3]) +
            this.dayFitness(daySchedules[4]);

        fitness.overlapPenalty *= config.overlapPenalty;
        fitness.timePreferencePenalty *= config.timePreferencePenalty;

        return fitness;
    }

    private static sectionFitness(
        section: Section,
        config: SchedulerWeights
    ): number {
        if (!section.instructorRatings) {
            return 0;
        }
        const fitness =
            ((section.instructorAvgRating || 2.5) - 2.5) *
            Math.log10(section.instructorRatings || 0) *
            config.teacherRatingWeight;
        return fitness;
    }

    private static dayFitness(daySchedule: TimeRange[]): number {
        let fitness = 0;
        if (this.timeConflict(daySchedule)) {
            fitness += 1;
        }
        return fitness;
    }

    private static timeConflict(daySchedule: TimeRange[]): boolean {
        daySchedule.sort(
            (a, b) => this.stampValue(a.start) - this.stampValue(b.end)
        );
        for (let i = 1; i < daySchedule.length; i++) {
            const a = daySchedule[i - 1];
            const b = daySchedule[i];
            if (
                this.stampValue(a.start) < this.stampValue(b.end) &&
                this.stampValue(b.start) < this.stampValue(a.end)
            ) {
                return true;
            }
        }
        return false;
    }

    private static stampValue(timestamp: Timestamp) {
        return timestamp.hours * 60 + timestamp.minutes;
    }

    public static *generateCourseSections(
        catalog: Course[],
        index: number = 0,
        partialSchedule: Section[] = []
    ): Generator<Section[]> {
        if (index == catalog.length) {
            yield partialSchedule;
        } else {
            for (const offering of catalog[index].offerings) {
                for (const sections of this.generateSections(offering)) {
                    yield* this.generateCourseSections(catalog, index + 1, [
                        ...partialSchedule,
                        ...sections,
                    ]);
                }
            }
        }
    }

    private static *generateSections(
        offering: Offering,
        index: number = 0,
        partialSections: Section[] = []
    ): Generator<Section[]> {
        if (index == offering.length) {
            yield partialSections;
        } else {
            for (const section of offering[index].sections) {
                yield* this.generateSections(offering, index + 1, [
                    ...partialSections,
                    section,
                ]);
            }
        }
    }

    private static stampsToRange(start: Timestamp, end: Timestamp) {
        const startStr = `${start.hours
            .toString()
            .padStart(2, "0")}:${start.minutes.toString().padStart(2, "0")}${
            start.hours < 12 ? "am" : "pm"
        }`;
        const endStr = `${end.hours.toString().padStart(2, "0")}:${end.minutes
            .toString()
            .padStart(2, "0")}${end.hours < 12 ? "am" : "pm"}`;
        return startStr + "-" + endStr;
    }
}
