import FormWrapper from "./FormWrapper";
import { useState, useRef, useEffect } from "react";
import { Course } from "../shared.types";
import Fuse from "fuse.js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

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
        <div className="mt-2 w-full rounded-md border border-slate-300">
            <div className="my-1 w-full overflow-clip">
                <ul>
                    {courses.slice(0, 5).map((course) => (
                        <li
                            key={course.id}
                            onMouseDown={() => addCourse(course)}
                            className="flex transition-transform duration-200 hover:translate-x-7 hover:bg-slate-100"
                        >
                            <span className="mx-5 inline-block w-20 min-w-20">
                                <b>{course.code}</b>
                            </span>
                            <span className="inline-block overflow-hidden text-ellipsis text-nowrap">
                                {course.title}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const CourseForm = ({ courses, updateFields }: CourseFormProps) => {
    let isInit = false;
    let availableCourses = useRef<Course[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");

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
            const data = await fetch(
                import.meta.env.VITE_API_ENDPOINT + "/courses"
            );
            const courseOptions: Course[] = await data.json();

            availableCourses.current = courseOptions;
        };

        if (!isInit) {
            fetchCourses().catch(console.error);
            isInit = true;
        }
    }, []);

    return (
        <>
            <FormWrapper title="What courses are you taking this term?">
                <div className="flex w-full flex-col items-center">
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
                                if (searchResult.length > 0) {
                                    addCourse(searchResult[0]);
                                }
                            }
                        }}
                    />
                    {searchQuery.trimStart().length > 0 && (
                        <Dropdown
                            courses={searchResult}
                            addCourse={addCourse}
                        />
                    )}
                    {courses.length > 0 && (
                        <table className="mt-8 w-full">
                            <tbody>
                                {courses.map((course) => {
                                    return (
                                        <tr
                                            key={course.id}
                                            className="flex items-center justify-between py-1 group-hover:bg-slate-500"
                                        >
                                            <td className="flex">
                                                <div className="inline-block min-w-20">
                                                    <b>{course.code}</b>
                                                </div>
                                                <div className="px-5">
                                                    {course.title}
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 px-4 py-2 text-white hover:bg-red-700"
                                                    onClick={() =>
                                                        removeCourse(course)
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faXmark}
                                                        size="1x"
                                                    />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </FormWrapper>
        </>
    );
};

export default CourseForm;
