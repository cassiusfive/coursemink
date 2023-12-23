import * as fs from 'fs';
import { Course, TimeTable } from '../shared.types';

// Define the file path to read
const filePath: string = 'courses.json'; // Change the filename and path as needed

// Read the file
fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    try {
        // Parse the JSON data
        const courses: Course[][][][] = JSON.parse(data);

        bestSchedule(courses);
    } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
    }
});

interface TimeRange {
    start: number,
    end: number
}

function bestSchedule(courses: Course[][][][]) {

    // Choose 1 offering per course
    // For all types per offering
    // Choose 1 section per type
    // console.log(randomSchedule(courses));
    const scheduleIter = generateSchedules(courses);
    let counter = 0;
    let optimalSchedule = null;
    let maxScore = -Infinity;

    for (const schedule of scheduleIter) {
        const fitness = scheduleFitness(schedule);
        if (fitness > maxScore) {
            optimalSchedule = schedule;
            console.log(optimalSchedule);
            maxScore = fitness;
        }
    }
}

function scheduleFitness(schedule: Course[]): number {
    const profScores: Record<string, number> = {
        'Boonstra, Michael J': 2,
        'Mutschler, Ben M': 2,
        'Fraser, Nick': 2,
        'Hatase, Tatsuhiko': 2,
        'Mathangadeera, Praveeni O': 2,
        'Udell, Chet J': 2,
        'Harper, Stacey': 2,
        'Al-Abdrabbuh, Sami A': 2,
        'Mallette, Natasha D': 2,
        'Clark, Jason V': 5,
        'Hoyle, Christopher J': 2,
        'Nix, Anthony A': 2,
        'Crease, Alexander S': 2,
        'Wright, Scott A': 2,
        'Istok, Jonathan D': 2,
        'Montfort, Devlin B': 2,
        'Fogg, Kaitlin': 2,
        'Alderman, Seth J': 2,
        'Orum, Chris': 2,
        'Gill, Sahir': 2,
        'Holm, Jackson R': 2,
        'Caze, Jessica T': 2,
        'Morgan, Mason J': 2,
        'Hilberg, Evan M': 2,
        'Smith, Stacey L': 2,
        'Zapata, Joel': 2
    }

    let fitness: number = 0;
    const daySchedules: TimeRange[][] = [[],[],[],[],[]];
    // M W T R F

    for (const section of schedule) {
        // fitness += profScores[section.instructorName];
        for (const [index, meetDay] of section.timeTable.days.entries()) {
            if (meetDay) {
                daySchedules[index].push({ start: section.timeTable.start, end: section.timeTable.end });
            }
        }
    }
    
    for (const daySchedule of daySchedules) {
        // Conflict
        if (timeConflict(daySchedule)) {
            fitness -= 1000;
        }
        // Prefered Time
        daySchedule.push({ start: 0, end: 599 });
        daySchedule.push({ start: 960, end: 1440});
        if (timeConflict(daySchedule)) {
            fitness -= 50;
        }
    }

    return fitness;
}

function timeConflict(timeRanges: TimeRange[]): boolean {
    timeRanges.sort((a, b) => a.end - b.end);
    for (let i = 1; i < timeRanges.length; i++) {
        const a = timeRanges[i - 1];
        const b = timeRanges[i];
        if (a.start < b.end && b.start < a.end) {
            return true;
        }
    }
    return false;
}

// Courses -> Course -> Offering -> Type -> Section
// 4, 3, 2, 1, 0
function* generateSections(offering: Course[][], index: number = 0, partialSections: Course[] = []): Generator<Course[]> {
    if (index == offering.length) {
        yield partialSections;
    } else {
        for (const section of offering[index]) {
            yield* generateSections(offering, index + 1, [...partialSections, section]);
        }
    }
}

function* generateSchedules(courses: Course[][][][], index: number = 0, partialSchedule: Course[] = []): Generator<Course[]> {
    if (index == courses.length) {
        yield partialSchedule;
    } else {
        for (const offering of courses[index]) {
            for (const sections of generateSections(offering)) {
                yield* generateSchedules(courses, index + 1, [...partialSchedule, ...sections]);
            }
        }
    }
}

function randomSchedule(courses: Course[][][][]): Course[] {
    const combination: Course[] = [];

    for (const course of courses) {
        const randomOffering = course[Math.floor((Math.random() * course.length))];
        for (const type of randomOffering) {
            combination.push(type[Math.floor(Math.random() * type.length)]);
        }
    }

    return combination;
}