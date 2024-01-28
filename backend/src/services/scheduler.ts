import { Course, Offering, Section, TimeRange } from "../shared.types";
import { MaxPriorityQueue, Comparator } from "max-priority-queue-typed";

type SectionEvent = {
    courseId: number;
    courseCode: string;
    courseTitle: string;
    timerange: string;
    start: number;
    length: number;
};

type Schedule = {
    monday: SectionEvent[];
    tuesday: SectionEvent[];
    wednesday: SectionEvent[];
    thursday: SectionEvent[];
    friday: SectionEvent[];
};

interface SchedulerWeights {
    // Hard constraints
    overlapPenalty: number;

    // Soft constraints
    preferredStartTime: Date;
    preferredEndTime: Date;
    timePreferencePenalty: number;
    timeCohesionPenalty: number;
    timeDispersionPenalty: number;
    teacherRatingWeight: number;
}

export class Scheduler {
    public static defaultWeights: SchedulerWeights = {
        overlapPenalty: -1000, // Filter schedule defects

        preferredStartTime: new Date(0), // 12:00am
        preferredEndTime: new Date(86400000), // 12:00pm
        timePreferencePenalty: -50,

        timeCohesionPenalty: -0.1, // Minimize time between first and last class (per minute delta)
        timeDispersionPenalty: 0, // Minimize differences in class time (per minute delta)
        teacherRatingWeight: 10,
    };

    public static findSchedules(
        catalog: Course[],
        options?: Partial<SchedulerWeights>
    ): Schedule[] {
        const config = { ...this.defaultWeights, ...(options || {}) };

        const comparator: Comparator<Section[]> = (a, b) => {
            return (
                this.evaluateFitness(a, config) -
                this.evaluateFitness(b, config)
            );
        };
        const queue = new MaxPriorityQueue<Section[]>([], {
            comparator: comparator,
        });

        for (const possibleSchedule of this.generateCourseSections(catalog)) {
            queue.add(possibleSchedule);
        }
        console.log(queue.size);
        return [];
    }

    private static overrideDefaults(
        config: SchedulerWeights
    ): SchedulerWeights {
        return Object.assign({}, this.defaultWeights, config);
    }

    private static evaluateFitness(
        schedule: Section[],
        config: SchedulerWeights
    ): number {
        let fitness = 0;
        let mondaySchedule: TimeRange[] = [];
        let tuesdaySchedule: TimeRange[] = [];
        let wednesdaySchedule: TimeRange[] = [];
        let thursdaySchedule: TimeRange[] = [];
        let fridaySchedule: TimeRange[] = [];

        const sectionMemo: Record<string, number> = {};
        for (const section of schedule) {
            if (sectionMemo[section.crn]) {
                fitness += sectionMemo[section.crn];
            } else {
                const sectionFitness = this.sectionFitness(section, config);
                sectionMemo[section.crn] = sectionFitness;
                fitness += sectionFitness;
            }
            const timeRange: TimeRange = {
                start: section.start,
                end: section.end,
            };
            if (section.onMonday) {
                mondaySchedule.push(timeRange);
            }
            if (section.onTuesday) {
                tuesdaySchedule.push(timeRange);
            }
            if (section.onWednesday) {
                wednesdaySchedule.push(timeRange);
            }
            if (section.onThursday) {
                thursdaySchedule.push(timeRange);
            }
            if (section.onFriday) {
                fridaySchedule.push(timeRange);
            }
        }

        fitness += this.dayFitness(mondaySchedule, config);
        fitness += this.dayFitness(tuesdaySchedule, config);
        fitness += this.dayFitness(wednesdaySchedule, config);
        fitness += this.dayFitness(thursdaySchedule, config);
        fitness += this.dayFitness(fridaySchedule, config);

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

    private static dayFitness(
        daySchedule: TimeRange[],
        config: SchedulerWeights
    ): number {
        let fitness = 0;
        let startOfDay = Infinity;
        let endOfDay = -Infinity;
        for (const timeRange of daySchedule) {
            startOfDay = Math.min(startOfDay, timeRange.start.getTime());
            endOfDay = Math.max(endOfDay, timeRange.end.getTime());
        }
        if (this.timeConflict(daySchedule)) {
            fitness += config.overlapPenalty!;
        }
        daySchedule.push({
            start: new Date(0),
            end: config.preferredStartTime!,
        });
        daySchedule.push({
            start: config.preferredEndTime!,
            end: new Date(86400000),
        });
        if (this.timeConflict(daySchedule)) {
            fitness += config.timePreferencePenalty!;
        }
        fitness += (endOfDay - startOfDay) * config.timeCohesionPenalty!;
        return fitness;
    }

    private static timeConflict(daySchedule: TimeRange[]): boolean {
        daySchedule.sort((a, b) => a.start.getTime() - b.end.getTime());
        for (let i = 1; i < daySchedule.length; i++) {
            const a = daySchedule[i - 1];
            const b = daySchedule[i];
            if (a.start < b.end && b.start < a.end) {
                return true;
            }
        }
        return false;
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
}
