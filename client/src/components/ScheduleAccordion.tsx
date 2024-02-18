import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCopy } from "@fortawesome/free-solid-svg-icons";

import { Course, Professor, Section, Timestamp } from "../shared.types";

const timeString = (start: Timestamp, end: Timestamp) => {
    let res = "";
    res += start.hours.toString();
    if (start.minutes) res += ":" + start.minutes.toString().padStart(2, "0");
    res += "-";
    res += start.hours.toString();
    if (end.minutes) res += ":" + end.minutes.toString().padStart(2, "0");
    res += end.hours < 12 ? "am" : "pm";
    return res;
};

const sectionTimeString = (section: Section) => {
    let res = "";
    if (section.onMonday) res += "M";
    if (section.onTuesday) res += "W";
    if (section.onWednesday) res += "T";
    if (section.onThursday) res += "R";
    if (section.onFriday) res += "F";
    res += " ";
    section.start;
    return res + timeString(section.start, section.end);
};

type CourseSpacerProps = {
    course: Course;
    color: string;
};

const CourseSpacer = ({ course, color }: CourseSpacerProps) => {
    return (
        <div
            className="flex flex-col p-3 text-white"
            style={{ backgroundColor: color }}
        >
            <b>
                {course.code}: {course.title}
            </b>
        </div>
    );
};

type InstructorDetailsProps = {
    instructor: Professor;
};

const InstructorDetails = ({ instructor }: InstructorDetailsProps) => {
    if (instructor.name == "Staff") {
        return <>No instructor assigned</>;
    }

    return (
        <>
            <div className="flex">
                <span>{instructor.name}</span>
                <span className="mx-5">
                    <b>{instructor.avgRating}/5</b>
                    {"  based on "}
                    <b>{instructor.numRatings}</b>{" "}
                    {instructor.numRatings > 1 ? "ratings" : "rating"}
                </span>
            </div>
        </>
    );
};

type PanelDetailsProps = {
    section: Section;
};

const PanelDetails = ({ section }: PanelDetailsProps) => {
    return (
        <div className="flex flex-col p-5">
            <div className="flex">
                <span className="">
                    <b>CRN: {section.crn}</b>
                    <button className="px-2">
                        <FontAwesomeIcon icon={faCopy}></FontAwesomeIcon>
                    </button>
                </span>
                <span className="mx-5">
                    <b>Section: {section.sectionNum}</b>
                </span>
                <span className="mx-5">
                    <b>
                        Enrollment: {section.currentEnrollment}/
                        {section.maxEnrollment}
                    </b>
                </span>
                <span className="ml-5">
                    <b>
                        Waitlist: {section.currentWaitlist}/
                        {section.maxWaitlist}
                    </b>
                </span>
            </div>
            <div className="mt-5 flex flex-col">
                <InstructorDetails instructor={section.professor} />
            </div>
        </div>
    );
};

type PanelProps = {
    section: Section;
    active: boolean;
    toggleActive: () => void;
};

const Panel = ({ section, active, toggleActive }: PanelProps) => {
    const rotation = active ? "rotate-90" : "rotate-0";
    const hide = active ? "max-h-[10rem]" : "max-h-0";
    return (
        <>
            <button
                className="flex w-full items-center bg-stone-200 p-2 px-4 transition duration-200 hover:bg-stone-300"
                onClick={toggleActive}
            >
                <FontAwesomeIcon
                    icon={faArrowRight}
                    className={"transition duration-200 " + rotation}
                ></FontAwesomeIcon>
                <b className="px-5">{section.type}</b>
                <span className="px-5">{sectionTimeString(section)}</span>
                <span className="px-5">{section.location}</span>
            </button>
            <div
                className={
                    "overflow-clip transition-max-height duration-300 " + hide
                }
            >
                <PanelDetails section={section} />
            </div>
        </>
    );
};

type AccordionProps = {
    courses: Course[];
    schedule: Section[];
    colorMap: Record<number, string>;
};

const ScheduleAccordion = ({ courses, schedule, colorMap }: AccordionProps) => {
    const [activeIndex, setActiveIndex] = useState<number>(1);

    const toggleActive = (index: number) => {
        if (index == activeIndex) {
            setActiveIndex(-1);
        } else {
            setActiveIndex(index);
        }
    };

    let i = 0;
    const accordionItems = courses.flatMap((course) => {
        const panels = schedule
            .filter((section) => section.courseId == course.id)
            .sort((a, b) => b.maxEnrollment - a.maxEnrollment)
            .map((section) => {
                const index = i++;
                const panel = (
                    <Panel
                        key={section.crn}
                        section={section}
                        active={index == activeIndex}
                        toggleActive={() => toggleActive(index)}
                    />
                );
                i++;
                return panel;
            });
        return (
            <>
                <CourseSpacer
                    course={course}
                    color={colorMap[+course.id]}
                    key={course.code}
                />
                {panels}
            </>
        );
    });

    return accordionItems;
};
export default ScheduleAccordion;
