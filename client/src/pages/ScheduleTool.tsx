import { useLocation } from "react-router-dom";
import { FormData } from "./ScheduleForm";
import { useState, useEffect } from "react";

import WeeklySchedule from "../components/WeeklySchedule";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faForward,
    faBackward,
    faList,
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
            const res = await fetch(
                import.meta.env.VITE_VITE_API_ENDPOINT + "/schedules",
                {
                    method: "POST",
                    headers: requestHeaders,
                    body: JSON.stringify({
                        courses: data.courses.map((course) => course.id),
                    }),
                }
            );
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
            <footer className="fixed bottom-0 z-50 flex min-h-20 w-full justify-between bg-neutral-800 align-middle">
                <div className="flex shrink grow basis-0 items-center justify-center text-nowrap text-3xl text-white">
                    <b className="">
                        {scheduleIndex + 1} / {schedules.length}
                    </b>
                </div>
                <div className="flex shrink grow basis-0 items-stretch justify-center">
                    <button
                        className={
                            "mr-5 px-2 text-white transition duration-200 hover:scale-125 active:scale-90 " +
                            (scheduleIndex === 0 ? "invisible" : "")
                        }
                        onClick={() => back()}
                    >
                        <FontAwesomeIcon icon={faBackward} size="3x" />
                    </button>
                    <button
                        className={
                            "ml-5 px-2 text-white transition duration-200 hover:scale-125 active:scale-90 " +
                            (scheduleIndex === schedules.length - 1
                                ? "invisible"
                                : "")
                        }
                        onClick={() => next()}
                    >
                        <FontAwesomeIcon icon={faForward} size="3x" />
                    </button>
                </div>
                <div className="flex shrink grow basis-0 items-center justify-center text-4xl text-white">
                    <FontAwesomeIcon icon={faList} />
                </div>
            </footer>
        </>
    );
};
export default ScheduleTool;
