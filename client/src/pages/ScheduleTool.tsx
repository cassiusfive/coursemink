import { useLocation } from "react-router-dom";
import { FormData } from "./ScheduleForm";

import WeeklySchedule from "../components/WeeklySchedule";

const ScheduleTool = () => {
    const data: FormData = useLocation().state;

    const colorbank: string[] = [
        "bg-red-500 hover:bg-red-700",
        "bg-blue-500 hover:bg-blue-700",
        "bg-green-500 hover:bg-green-700",
    ];

    const colors: Record<number, string> = data.courses.reduce(
        (acc: Record<number, string>, course, index) => {
            acc[course.id] = colorbank[index];
            return acc;
        },
        {}
    );

    return (
        <>
            <h1 className="text-3xl font-bold text-center p-5">Scheduling</h1>
            <div className="px-10 flex justify-center h-[calc(80vh-2rem)]">
                <WeeklySchedule colors={colors} />
            </div>
        </>
    );
};
export default ScheduleTool;
