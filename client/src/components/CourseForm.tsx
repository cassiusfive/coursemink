import FormWrapper from "./FormWrapper";
import { useState, useRef, useEffect } from "react";
import { Course } from "../shared.types";
import Fuse from "fuse.js";

export type CourseData = {
    courses: Course[];
};

type CourseFormProps = CourseData & {
    updateFields: (fields: Partial<CourseData>) => void;
};

type DropdownProps = {
    courses: Course[];
    addCourse: (course: Course) => void;
};

const Dropdown = ({ courses, addCourse }: DropdownProps) => {
    return (
        <div className="mt-2 w-full rounded-md border border-slate-300 py-1">
            {courses.slice(0, 5).map((course) => (
                <div
                    key={course.id}
                    onMouseDown={() => addCourse(course)}
                    tabIndex={0}
                    className="flex justify-start hover:bg-slate-100"
                >
                    <b className="px-5">{course.code}</b>
                    <span className="overflow-hidden text-ellipsis text-nowrap pr-5">
                        {course.title}
                    </span>
                </div>
            ))}
        </div>
    );
};

const CourseForm = ({ courses, updateFields }: CourseFormProps) => {
    let isInit = false;
    let availableCourses = useRef<Course[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showDropdown, setShowDropdown] = useState<boolean>(true);

    const fuse = new Fuse(availableCourses.current, {
        keys: ["title", "code"],
    });
    const fuseResults = fuse.search(searchQuery);
    fuseResults.filter((course) => {
        return course.item.id;
    });
    const searchResult = fuseResults
        .slice(0, 10)
        .map((result) => result.item)
        .filter(
            (course) => !courses.map((course) => course.id).includes(course.id)
        );

    function addCourse(course: Course): void {
        updateFields({ courses: [...courses, course] });
        setSearchQuery("");
    }

    function removeCourse(course: Course): void {
        const newCourses = courses.filter((x) => {
            return x.id != course.id;
        });
        updateFields({ courses: newCourses });
    }

    useEffect(() => {
        const fetchCourses = async () => {
            const data = await fetch("http://localhost:3000/v1/courses");
            const courseOptions: Course[] = await data.json();

            availableCourses.current = courseOptions;
        };

        if (!isInit) {
            fetchCourses().catch(console.error);
            isInit = true;
        }
    }, []);

    return (
        <FormWrapper title="What courses are you taking this term?">
            <input
                type="text"
                value={searchQuery}
                placeholder="Find a course"
                className="w-full rounded-md border border-slate-300 px-5 py-3"
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key == "Enter") {
                        e.preventDefault();
                        addCourse(searchResult[0]);
                    }
                }}
                onFocus={() => {
                    setShowDropdown(true);
                }}
                onBlur={() => {
                    setShowDropdown(false);
                }}
            />
            {showDropdown && searchQuery.trimStart().length > 0 && (
                <Dropdown courses={searchResult} addCourse={addCourse} />
            )}
            <table className="mt-8 w-full">
                {courses.map((course) => {
                    return (
                        <tr
                            key={course.id}
                            className="flex items-center justify-between py-1"
                        >
                            <td className="flex">
                                <div className="inline-block min-w-20">
                                    <b>{course.code}</b>
                                </div>
                                <div className="px-5">{course.title}</div>
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-700"
                                    onClick={() => removeCourse(course)}
                                >
                                    remove
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </table>
        </FormWrapper>
    );
};

export default CourseForm;
