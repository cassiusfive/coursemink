import { Course } from './shared.types';
import dotenv from 'dotenv';
import RegistrationScraper from './scraping/registrationScraper.js';
import * as fs from 'fs';

dotenv.config();

const scraper = await RegistrationScraper.create();

const myClasses = [
    'VECTOR CALCULUS I',
    'WEIGHT TRAINING I',
    'DESIGN ENGINEERING AND PROBLEM SOLVING',
    '*INTRODUCTION TO THE VISUAL ARTS',
    '*HISTORY OF THE UNITED STATES',
]

const allSections: Array<Array<Array<Array<Course>>>> = [];
// Courses -> Offerings -> Types -> Sections -> Section

await Promise.all(myClasses.map(async (course: string) => {
    const sections = await scraper.getCourses(course);

    const sectionBlocks = sections.reduce((acc: any, section: Course) => {
        if (!acc[section.linkIdentifier]) {
            acc[section.linkIdentifier] = []
        }
        acc[section.linkIdentifier].push(section);
        return acc;
    }, {});

    for (const keyStart in sectionBlocks) {
        const linkedSections = await scraper.getLinked(sectionBlocks[keyStart][0].crn);
        for (let i = 0; i < linkedSections.length; i++) {
            const keyEnd = linkedSections[i].linkIdentifier;
            if (sectionBlocks[keyEnd] && sectionBlocks[keyStart]) {
                sectionBlocks[keyStart].push(...sectionBlocks[keyEnd]);
                delete sectionBlocks[keyEnd];
            }
        }
    }

    let courseOfferings: Array<Array<Array<Course>>> = [];
    for (const [key, value] of Object.entries<Array<Course>>(sectionBlocks)) {
        courseOfferings.push(Object.values(value.reduce((acc: any, section: Course) => {
            if (!acc[section.type]) {
                acc[section.type] = [];
            }
            acc[section.type].push(section);
            return acc;
        }, {})));
    }
    console.log(course);
    allSections.push(courseOfferings);
}));

fs.writeFile('courses.json', JSON.stringify(allSections), (err) => {
    if (err) {
        console.error('Error writing to file:', err);
        return;
    }
    console.log('Data has been written to', 'courses.json');
})