import { CourseCatalog, Course, Offering, SectionType, Section, TimeRange } from "../shared.types";

type Schedule = Section[];

interface SchedulerWeights {
    // Hard constraints
    overlapPenalty?: number,

    // Soft constraints
    preferredStartTime?: number,
    preferredEndTime?: number,
    timeCohesionPenalty?: number,
    timeDispersionPenalty?: number
}

export default class Scheduler {
    public static defaultWeights: SchedulerWeights = {
        overlapPenalty: -1000, // Filter schedule defects
        preferredStartTime: 0, // 12:00am
        preferredEndTime: 1440, // 12:00pm
        timeCohesionPenalty: 0, // Minimize time between first and last class (per hour)
        timeDispersionPenalty: 0, // Minimize differences in class time (per credit delta)
    }

    public static findOptimal(catalog: CourseCatalog, config: SchedulerWeights = {}): Schedule {
        config = this.overrideDefaults(config)

        let maxFitness: number = -Infinity;
        let optimalSchedule: Schedule = [];
        for (const schedule of this.generateSchedules(catalog)) {
            let fitness = this.scheduleFitness(schedule, config);
            if (fitness > maxFitness) {
                maxFitness = fitness;
                optimalSchedule = schedule;
            }
        }
        return optimalSchedule;
    }

    private static overrideDefaults(config: SchedulerWeights): SchedulerWeights {
        for (const key in config) {
            config[key as keyof SchedulerWeights] = config[key as keyof SchedulerWeights] || Scheduler.defaultWeights[key as keyof SchedulerWeights];
        }
        return config
    }

    private static scheduleFitness(schedule: Schedule, config: SchedulerWeights): number {
        let fitness = 0;
        let mondaySchedule: TimeRange[] = [];
        let tuesdaySchedule: TimeRange[] = [];
        let wednesdaySchedule: TimeRange[] = [];
        let thursdaySchedule: TimeRange[] = [];
        let fridaySchedule: TimeRange[] = [];

        for (const section of schedule) {
            fitness += this.sectionFitness(section, config);
            if (section.isMondayIncluded) { mondaySchedule.push(section.schedule); }
            if (section.isTuesdayIncluded) { tuesdaySchedule.push(section.schedule); }
            if (section.isWednesdayIncluded) { wednesdaySchedule.push(section.schedule); }
            if (section.isThursdayIncluded) { thursdaySchedule.push(section.schedule); }
            if (section.isFridayIncluded) { fridaySchedule.push(section.schedule); }
        }

        fitness += this.dayFitness(mondaySchedule, config);

        return fitness
    }   

    private static sectionFitness(section: Section, config: SchedulerWeights): number {
        let fitness = 0;
        return fitness;
    }

    private static dayFitness(daySchedule: TimeRange[], config: SchedulerWeights): number {
        let fitness = 0;
        let startOfDay = Infinity;
        let endOfDay = -Infinity;
        if (this.timeConflict(daySchedule)) {
            fitness += config.overlapPenalty!;
        }
        for (const timeRange of daySchedule) {
            startOfDay = Math.min(startOfDay, timeRange.start);
            endOfDay = Math.max(endOfDay, timeRange.end);
        }
        fitness += (endOfDay - startOfDay) * config.timeCohesionPenalty!;
        return fitness;
    }

    private static timeConflict(daySchedule: TimeRange[]): boolean {
        daySchedule.sort((a, b) => a.end - b.end);
        for (let i = 1; i < daySchedule.length; i++) {
            const a = daySchedule[i - 1];
            const b = daySchedule[i];
            if (a.start < b.end && b.start < a.end) {
                return true;
            }
        }
        return false;
    }

    public static *generateSchedules(catalog: CourseCatalog, index: number = 0, partialSchedule: Schedule = []): Generator<Schedule> {
        if (index == catalog.length) {
            yield partialSchedule;
        } else {
            for (const offering of catalog[index].offerings) {
                for (const sections of this.generateSections(offering)) {
                    yield* this.generateSchedules(catalog, index + 1, [...partialSchedule, ...sections]);
                }
            }
        }
    }

    private static *generateSections(offering: Offering, index: number = 0, partialSections: Section[] = []): Generator<Section[]> {
        if (index == offering.length) {
            yield partialSections;
        } else {
            for (const section of offering[index].sections) {
                yield* this.generateSections(offering, index + 1, [...partialSections, section]);
            }
        }
    }
}



// function bestSchedule(courses: Course[][][][]) {

//     // Choose 1 offering per course
//     // For all types per offering
//     // Choose 1 section per type
//     // console.log(randomSchedule(courses));
//     const scheduleIter = generateSchedules(courses);
//     let counter = 0;
//     let optimalSchedule = null;
//     let maxScore = -Infinity;

//     for (const schedule of scheduleIter) {
//         const fitness = scheduleFitness(schedule);
//         if (fitness > maxScore) {
//             optimalSchedule = schedule;
//             console.log(optimalSchedule);
//             maxScore = fitness;
//         }
//     }
// }

// function scheduleFitness(schedule: Course[]): number {
//     const profScores: Record<string, number> = {
//         'Boonstra, Michael J': 2,
//         'Mutschler, Ben M': 2,
//         'Fraser, Nick': 2,
//         'Hatase, Tatsuhiko': 2,
//         'Mathangadeera, Praveeni O': 2,
//         'Udell, Chet J': 2,
//         'Harper, Stacey': 2,
//         'Al-Abdrabbuh, Sami A': 2,
//         'Mallette, Natasha D': 2,
//         'Clark, Jason V': 5,
//         'Hoyle, Christopher J': 2,
//         'Nix, Anthony A': 2,
//         'Crease, Alexander S': 2,
//         'Wright, Scott A': 2,
//         'Istok, Jonathan D': 2,
//         'Montfort, Devlin B': 2,
//         'Fogg, Kaitlin': 2,
//         'Alderman, Seth J': 2,
//         'Orum, Chris': 2,
//         'Gill, Sahir': 2,
//         'Holm, Jackson R': 2,
//         'Caze, Jessica T': 2,
//         'Morgan, Mason J': 2,
//         'Hilberg, Evan M': 2,
//         'Smith, Stacey L': 2,
//         'Zapata, Joel': 2
//     }

//     let fitness: number = 0;
//     const daySchedules: TimeRange[][] = [[],[],[],[],[]];
//     // M W T R F

//     for (const section of schedule) {
//         // fitness += profScores[section.instructorName];
//         for (const [index, meetDay] of section.timeTable.days.entries()) {
//             if (meetDay) {
//                 daySchedules[index].push({ start: section.timeTable.start, end: section.timeTable.end });
//             }
//         }
//     }
    
//     for (const daySchedule of daySchedules) {
//         // Conflict
//         if (timeConflict(daySchedule)) {
//             fitness -= 1000;
//         }
//         // Prefered Time
//         daySchedule.push({ start: 0, end: 599 });
//         daySchedule.push({ start: 960, end: 1440});
//         if (timeConflict(daySchedule)) {
//             fitness -= 50;
//         }
//     }

//     return fitness;
// }

// function timeConflict(timeRanges: TimeRange[]): boolean {
//     timeRanges.sort((a, b) => a.end - b.end);
//     for (let i = 1; i < timeRanges.length; i++) {
//         const a = timeRanges[i - 1];
//         const b = timeRanges[i];
//         if (a.start < b.end && b.start < a.end) {
//             return true;
//         }
//     }
//     return false;
// }

// // Courses -> Course -> Offering -> Type -> Section
// // 4, 3, 2, 1, 0




// function randomSchedule(courses: Course[][][][]): Course[] {
//     const combination: Course[] = [];

//     for (const course of courses) {
//         const randomOffering = course[Math.floor((Math.random() * course.length))];
//         for (const type of randomOffering) {
//             combination.push(type[Math.floor(Math.random() * type.length)]);
//         }
//     }

//     return combination;
// }