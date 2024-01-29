import { useLocation } from "react-router-dom";
import { FormData } from "./ScheduleForm";
import { useState, useEffect } from "react";

import WeeklySchedule from "../components/WeeklySchedule";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faForward, faBackward } from "@fortawesome/free-solid-svg-icons";

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
        "bg-blue-500 hover:bg-blue-700",
        "bg-green-500 hover:bg-green-700",
        "bg-pink-500 hover:bg-pink-700",
        "bg-yellow-500 hover:bg-yellow-700",
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
            <div className="px-10 py-10">
                <div className="flex justify-center">
                    <WeeklySchedule
                        colors={colors}
                        schedule={schedules[scheduleIndex]}
                    />
                </div>
            </div>
            <footer className="fixed bottom-0 z-50 w-full bg-slate-500">
                <div className="">
                    <div className="flex min-h-20 items-stretch justify-center">
                        <button
                            className={
                                "rounded-md px-12 text-white transition duration-200 hover:scale-125 active:scale-90 " +
                                (scheduleIndex === 0 ? "collapse" : "")
                            }
                            onClick={() => back()}
                        >
                            <FontAwesomeIcon icon={faBackward} size="3x" />
                        </button>
                        <button
                            className={
                                "rounded-md px-12 text-white transition duration-200 hover:scale-125 active:scale-90 " +
                                (scheduleIndex === schedules.length - 1
                                    ? "collapse"
                                    : "")
                            }
                            onClick={() => next()}
                        >
                            <FontAwesomeIcon icon={faForward} size="3x" />
                        </button>
                    </div>
                </div>
            </footer>
        </>
    );
};
export default ScheduleTool;
