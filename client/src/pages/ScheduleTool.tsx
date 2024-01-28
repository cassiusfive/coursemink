import { useLocation } from "react-router-dom";
import { FormData } from "./ScheduleForm";
import { useState, useEffect } from "react";

import WeeklySchedule from "../components/WeeklySchedule";

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
            <div className="flex justify-center">
                <div className="grow px-10 flex flex-col justify-center">
                    Prof. Score:{" "}
                    <b>{schedules[scheduleIndex].professorScore || 0}</b>
                </div>
                <div className="grow px-10 flex flex-col justify-center">
                    Overlap Penalty:{" "}
                    <b>{schedules[scheduleIndex].overlapPenalty || 0}</b>
                </div>
                <div className="grow px-10 flex flex-col justify-center">
                    Time Preference Penalty:{" "}
                    <b>{schedules[scheduleIndex].timePreferencePenalty || 0}</b>
                </div>
                <button
                    className="bg-slate-500 hover:bg-slate-700 text-white my-4 mx-4 rounded-md min-w-12"
                    onClick={() => back()}
                >
                    {"<"}
                </button>
                <h1 className="text-3xl font-bold text-center p-5 grow">
                    Scheduling
                </h1>
                <button
                    className="bg-slate-500 hover:bg-slate-700 text-white my-4 mx-4 rounded-md min-w-12"
                    onClick={() => next()}
                >
                    {">"}
                </button>
            </div>
            <div className="px-10 flex justify-center h-[calc(80vh-2rem)]">
                <WeeklySchedule
                    colors={colors}
                    schedule={schedules[scheduleIndex]}
                />
            </div>
        </>
    );
};
export default ScheduleTool;
