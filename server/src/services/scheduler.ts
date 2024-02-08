import { DeepRequired } from "utility-types";
import {
    Course,
    Offering,
    Section,
    TimeRange,
    Timestamp,
} from "../shared.types";

type SchedulerResult = {
    sectionToCourse: Record<number, number>;
    schedules: ScoredSections[];
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

type FitnessFunction = (
    sections: DeepRequired<Section[]>,
    config: SchedulerWeights
) => Fitness;

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
        catalog: DeepRequired<Course>[],
        options?: Partial<SchedulerWeights>
    ): SchedulerResult {
        const config = { ...this.defaultWeights, ...(options || {}) };
        const queue: Section[][] = [];

        console.time("tabu");

        this.tabuSearch(catalog, config);

        console.timeEnd("tabu");

        return {
            sectionToCourse: [], // CRN -> Course Index
            schedules: [],
        };
    }

    public static tabuSearch(
        catalog: DeepRequired<Course>[],
        options: Partial<SchedulerWeights>
    ): void {
        const sectionToCourse: Record<string, DeepRequired<Course>> = {};
        const sectionToOffering: Record<string, DeepRequired<Offering>> = {};
        catalog.forEach((course) => {
            for (const offering of course.offerings) {
                for (const sectionType of offering) {
                    for (const section of sectionType.sections) {
                        sectionToCourse[section.crn] = course;
                        sectionToOffering[section.crn] = offering;
                    }
                }
            }
        });

        const iterations = 5000;
        const maxTabusize = 100;
        const generator = this.generateCourseSections(catalog);
        let canidate: DeepRequired<Section>[] = generator.next().value;

        for (let i = 0; i < 100000; i++) {
            const neighbors = Array.from(
                this.generateNeighbors(
                    catalog,
                    canidate,
                    sectionToCourse,
                    sectionToOffering
                )
            );

            canidate = neighbors[5];
        }
        console.log(canidate);
    }

    private static evaluateFitness(
        schedule: DeepRequired<Section>[],
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
        section: DeepRequired<Section>,
        config: SchedulerWeights
    ): number {
        if (section.professor.num_ratings == 0) {
            return 0;
        }
        const fitness =
            ((section.professor.avg_rating || 2.5) - 2.5) *
            Math.log10(section.professor.num_ratings || 1) *
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
        catalog: DeepRequired<Course[]>,
        index: number = 0,
        partialSchedule: DeepRequired<Section>[] = []
    ): Generator<DeepRequired<Section>[]> {
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
        offering: DeepRequired<Offering>,
        index: number = 0,
        partialSections: DeepRequired<Section[]> = []
    ): Generator<DeepRequired<Section[]>> {
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

    public static *generateNeighbors(
        courses: DeepRequired<Course>[],
        schedule: DeepRequired<Section>[],
        sectionToCourse: Record<string, DeepRequired<Course>>,
        sectionToOffering: Record<string, DeepRequired<Offering>>
    ): Generator<DeepRequired<Section[]>> {
        let scheduleIndex = 0;
        while (scheduleIndex < schedule.length) {
            let offering: DeepRequired<Offering> =
                sectionToOffering[schedule[scheduleIndex].crn];

            const newSchedule = [...schedule];
            newSchedule.splice(scheduleIndex, offering.length);
            if (Math.random() < 0.2) {
                const course = sectionToCourse[schedule[scheduleIndex].crn];
                const numOfferings = course.offerings.length;
                offering =
                    course.offerings[Math.floor(Math.random() * numOfferings)];
            }
            for (const possibleSections of this.generateSections(offering)) {
                const tempSchedule = [...newSchedule];
                for (const section of possibleSections) {
                    tempSchedule.splice(scheduleIndex, 0, section);
                }
                yield tempSchedule;
            }
            scheduleIndex += offering.length;
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
