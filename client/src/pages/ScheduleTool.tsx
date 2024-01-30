import { useLocation } from "react-router-dom";
import { FormData } from "./ScheduleForm";
import { useState, useEffect } from "react";

import WeeklySchedule from "../components/WeeklySchedule";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faForward,
    faBackward,
    faChalkboardTeacher,
    faClock,
} from "@fortawesome/free-solid-svg-icons";

export type SectionEvent = {
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

export type Schedule = {
    monday: SectionEvent[];
    tuesday: SectionEvent[];
    wednesday: SectionEvent[];
    thursday: SectionEvent[];
    friday: SectionEvent[];
    professorScore?: number;
    overlapPenalty?: number;
    timePreferencePenalty?: number;
};

const ScheduleTool = () => {
    const data: FormData = useLocation().state;

    const colorbank: string[] = [
        "bg-red-500 hover:bg-red-700",
        "bg-cyan-500 hover:bg-cyan-700",
        "bg-green-500 hover:bg-green-700",
        "bg-purple-500 hover:bg-purple-700",
        "bg-orange-500 hover:bg-orange-700",
    ];

    const colors: Record<number, string> = data.courses.reduce(
        (acc: Record<number, string>, course, index) => {
            acc[course.id] = colorbank[index];
            return acc;
        },
        {}
    );

    const INITIAL_DATA: Schedule[] = [
        {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            professorScore: 0,
            overlapPenalty: 0,
            timePreferencePenalty: 0,
        },
    ];

    const [schedules, setSchedules] = useState<Schedule[]>(INITIAL_DATA);
    const [scheduleIndex, setScheduleIndex] = useState<number>(0);
    let isInit = false;

    useEffect(() => {
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set("Content-Type", "application/json");
        const fetchSchedules = async () => {
            const res = await fetch("http://localhost:3000/v1/schedules", {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify({
                    courses: data.courses.map((course) => course.id),
                }),
            });
            if (res.ok) {
                const json = await res.json();
                setSchedules(json);
            }
        };

        if (!isInit) {
            fetchSchedules().catch(console.error);
            isInit = true;
        }
    }, []);

    const next = () => {
        if (scheduleIndex === schedules.length - 1) return;
        setScheduleIndex((i) => i + 1);
    };

    const back = () => {
        if (scheduleIndex === 0) return;
        setScheduleIndex((i) => i - 1);
    };

    return (
        <>
            <div className="mb-28 mt-10 px-10">
                <div>
                    <WeeklySchedule
                        colors={colors}
                        schedule={schedules[scheduleIndex]}
                    />
                </div>
            </div>
            <footer className="fixed bottom-0 z-50 flex w-full justify-between bg-neutral-800 align-middle">
                <div className="mx-24 grid grow grid-cols-[min-content_1fr] items-center justify-between gap-y-2 py-3 text-xl text-white">
                    <FontAwesomeIcon icon={faChalkboardTeacher} size="lg" />
                    <div
                        className="ml-4 h-4 grow rounded-sm bg-green-300 transition-[width] duration-150"
                        style={{ width: `${scheduleIndex * 50}%` }}
                    ></div>
                    <FontAwesomeIcon icon={faClock} size="lg" />
                    <div className="ml-4 h-4 grow rounded-sm bg-blue-300"></div>
                </div>
                <div className="flex min-h-20 items-stretch justify-center">
                    <button
                        className={
                            "mr-5 px-2 text-white transition duration-200 hover:scale-125 active:scale-90 " +
                            (scheduleIndex === 0 ? "collapse" : "")
                        }
                        onClick={() => back()}
                    >
                        <FontAwesomeIcon icon={faBackward} size="3x" />
                    </button>
                    <button
                        className={
                            "ml-5 px-2 text-white transition duration-200 hover:scale-125 active:scale-90 " +
                            (scheduleIndex === schedules.length - 1
                                ? "collapse"
                                : "")
                        }
                        onClick={() => next()}
                    >
                        <FontAwesomeIcon icon={faForward} size="3x" />
                    </button>
                </div>
                <div className="flex grow items-center justify-center text-nowrap pr-6 text-3xl text-white">
                    <b className=" w-40">
                        {scheduleIndex + 1} / {schedules.length}
                    </b>
                </div>
            </footer>
        </>
    );
};
export default ScheduleTool;
