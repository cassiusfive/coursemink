import { DeepRequired } from "utility-types";
import {
    Course,
    Offering,
    Section,
    TimeRange,
    Timestamp,
} from "../shared.types";
import { PriorityQueue, ICompare } from "@datastructures-js/priority-queue";

import { xxHash32 } from "js-xxhash";

export type SchedulerWeights = {
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

type ScoredSchedule = {
    sections: DeepRequired<Section>[];
    fitness: number;
};

type FlatSection = Section & { courseId: number; type: string };

type SchedulerResult = {
    sections: Record<string, FlatSection>;
    schedules: string[][]; // List of schedules including CRNS
};

export class Scheduler {
    public static defaultWeights: SchedulerWeights = {
        overlapPenalty: -1000, // Filter schedule defects

        preferredStartTime: { hours: 10, minutes: 0 }, // 10:00am
        preferredEndTime: { hours: 17, minutes: 0 }, // 5:00pm
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

        const sections: Record<string, FlatSection> = {};
        catalog.forEach((course) => {
            course.offerings.forEach((offering) => {
                offering.forEach((sectionType) => {
                    sectionType.sections.forEach((section) => {
                        sections[section.crn] = {
                            ...section,
                            courseId: course.id,
                            type: sectionType.name,
                        };
                    });
                });
            });
        });

        console.time("stochastic");
        const schedules = this.stochasticSearch(catalog, config);
        console.timeEnd("stochastic");

        return {
            sections: sections,
            schedules: schedules,
        };
    }

    public static stochasticSearch(
        catalog: DeepRequired<Course>[],
        config: SchedulerWeights
    ): string[][] {
        const iterations = 40000;
        const compareSchedules: ICompare<ScoredSchedule> = (a, b) => {
            if (a.fitness < b.fitness) {
                return 1;
            }
            return -1;
        };
        const scheduleQueue = new PriorityQueue<ScoredSchedule>(
            compareSchedules
        );
        for (let i = 0; i < iterations; i++) {
            const sections = this.randomSchedule(catalog);
            scheduleQueue.push({
                sections: sections,
                fitness: this.fitness(sections, config),
            });
        }
        let res: string[][] = [];
        let hashSet: Set<number> = new Set();
        console.log(scheduleQueue);
        while (!scheduleQueue.isEmpty() && res.length < 200) {
            const topSchedule = scheduleQueue
                .pop()
                .sections.map((section) => section.crn);
            const hash = this.hashStringSet(topSchedule);
            if (!hashSet.has(hash)) res.push(topSchedule);
            hashSet.add(hash);
        }
        return res;
    }

    public static tabuSearch(
        catalog: DeepRequired<Course>[],
        config: SchedulerWeights
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

        const compareSchedules: ICompare<ScoredSchedule> = (a, b) => {
            if (a.fitness < b.fitness) {
                return 1;
            }
            return -1;
        };

        const iterations = 1000;
        const maxTabuSize = 30;
        const scheduleQueue = new PriorityQueue<ScoredSchedule>(
            compareSchedules
        );
        let tabuHashList: number[] = [];

        for (let i = 0; i < 1; i++) {
            const sections = this.randomSchedule(catalog);
            scheduleQueue.push({
                sections: sections,
                fitness: this.fitness(sections, config),
            });
        }

        let bestCandidate = scheduleQueue.front();

        for (let i = 0; i < iterations; i++) {
            let highestFitness = Number.NEGATIVE_INFINITY;
            for (const canidate of Array.from(
                this.generateNeighbors(
                    bestCandidate.sections,
                    sectionToCourse,
                    sectionToOffering
                )
            ).map((schedule) => {
                return {
                    sections: schedule,
                    fitness: this.fitness(schedule, config),
                };
            })) {
                if (
                    !tabuHashList.includes(
                        this.hashSchedule(canidate.sections)
                    ) &&
                    canidate.fitness > highestFitness
                ) {
                    bestCandidate = canidate;
                }
            }
            scheduleQueue.push(bestCandidate);
            tabuHashList.push(this.hashSchedule(bestCandidate.sections));
            if (tabuHashList.length > maxTabuSize) {
                tabuHashList.shift();
            }
        }
        console.log(scheduleQueue.front().fitness);
        // console.log(bestSchedule);
        // console.log(this.evaluateFitness(bestSchedule, config));
        // console.log(iterations);
    }

    private static hashSchedule(schedule: DeepRequired<Section>[]): number {
        let hash = 0;
        for (const section of schedule) {
            hash ^= xxHash32(Buffer.from(section.crn.toString(), "utf-8"));
        }
        return hash;
    }

    private static hashStringSet(strs: string[]): number {
        let hash = 0;
        for (const str of strs) {
            hash ^= xxHash32(Buffer.from(str.toString(), "utf-8"));
        }
        return hash;
    }

    private static fitness(
        schedule: DeepRequired<Section>[],
        config: SchedulerWeights
    ): number {
        const fitness = this.evaluateFitness(schedule, config);
        return (
            fitness.professorScore +
            fitness.overlapPenalty +
            fitness.timePreferencePenalty
        );
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

        if (fitness.overlapPenalty > 100) return fitness;

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
        if (section.professor.numRatings == 0) {
            return 0;
        }
        const fitness =
            ((section.professor.avgRating || 2.5) - 2.5) *
            Math.log10(section.professor.numRatings || 1) *
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
            (a, b) => this.stampValue(a.start) - this.stampValue(b.start)
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
            if (Math.random() < 0.5) {
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

    public static randomSchedule(
        catalog: DeepRequired<Course>[]
    ): DeepRequired<Section>[] {
        const schedule: DeepRequired<Section>[] = [];
        for (const course of catalog) {
            const offering =
                course.offerings[
                    Math.floor(Math.random() * course.offerings.length)
                ];
            for (const sectionType of offering) {
                schedule.push(
                    sectionType.sections[
                        Math.floor(Math.random() * sectionType.sections.length)
                    ]
                );
            }
        }
        return schedule;
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
