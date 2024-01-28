import { useMultistepForm } from "../useMultistepForm";
import { useState, FormEvent } from "react";
import { Course } from "../shared.types";

import CourseForm from "../components/CourseForm";
import PreferenceForm from "../components/PreferenceForm";
import { useNavigate } from "react-router-dom";

export type FormData = {
    courses: Course[];
    prefStart: string;
    prefEnd: string;
};

const INITIAL_DATA = {
    courses: [],
    prefStart: "10:00",
    prefEnd: "16:00",
};

const ScheduleForm = () => {
    const [data, setData] = useState<FormData>(INITIAL_DATA);
    function updateFields(fields: Partial<FormData>) {
        setData((prev) => {
            return { ...prev, ...fields };
        });
    }
    const { step, next, back, isFirstStep, isLastStep } = useMultistepForm([
        <CourseForm {...data} updateFields={updateFields} />,
        <PreferenceForm {...data} updateFields={updateFields} />,
    ]);

    const navigate = useNavigate();

    function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (!isLastStep) {
            return next();
        }
        navigate("/schedule/tool", { state: data });
    }

    return (
        <form onSubmit={onSubmit}>
            {step}
            <div className="flex px-10 justify-between">
                {!isFirstStep && (
                    <button
                        type="button"
                        className="bg-slate-500 hover:bg-slate-700 text-white py-2 px-4 rounded-md"
                        onClick={back}
                    >
                        back
                    </button>
                )}
                <div />
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                >
                    {isLastStep ? "submit" : "continue"}
                </button>
            </div>
        </form>
    );
};
export default ScheduleForm;
