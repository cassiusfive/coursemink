import { useState } from "react";

import { Schedule } from "../pages/ScheduleTool";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCopy } from "@fortawesome/free-solid-svg-icons";

type PanelProps = {
    active: boolean;
    toggleActive: () => void;
};

const SectionDetails = () => {
    return (
        <div className="flex flex-col p-5">
            <div className="flex">
                <span className="">
                    <b>CRN: 51834</b>
                    <button className="px-2">
                        <FontAwesomeIcon icon={faCopy}></FontAwesomeIcon>
                    </button>
                </span>
                <span className="mx-5">
                    <b>Section: 010</b>
                </span>
                <span className="mx-5">
                    <b>Enrollment: 0/105</b>
                </span>
                <span className="ml-5">
                    <b>Waitlist: 3/5</b>
                </span>
            </div>
            <div className="mt-5 flex flex-col">
                <span>
                    Samaneh Yourdkhani
                    <a
                        href="https://www.ratemyprofessors.com/professor/2673409"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="px-5 text-blue-700 underline"
                    >
                        (Rate My Professor)
                    </a>
                </span>
                <span className="mt-2">
                    <b>2.8/5</b>
                    <span className="px-3">based on 23 ratings</span>
                </span>
            </div>
        </div>
    );
};

const Panel = ({ active, toggleActive }: PanelProps) => {
    const rotation = active ? "rotate-90" : "rotate-0";
    const hide = active ? "max-h-40" : "max-h-0";
    return (
        <>
            <button
                className="flex w-full items-center bg-stone-200 p-2 px-4 transition duration-200 hover:bg-stone-300"
                onClick={toggleActive}
            >
                <FontAwesomeIcon
                    icon={faArrowRight}
                    className={"transition duration-300 " + rotation}
                ></FontAwesomeIcon>
                <b className="px-5">Lecture</b>
                <span className="px-5">MWF 11-11:50am</span>
                <span className="px-5">Kidder Hall 350</span>
            </button>
            <div
                className={
                    "overflow-clip transition-max-height duration-200 " + hide
                }
            >
                <SectionDetails />
            </div>
        </>
    );
};

type AccordionProps = {
    schedule: Schedule;
};

const ScheduleAccordion = ({ schedule }: AccordionProps) => {
    const [activePanels, setActivePanels] = useState<boolean[]>([
        false,
        true,
        false,
        false,
    ]);

    const togglePanel = (index: number) => {
        console.log(activePanels[index]);
        setActivePanels((prev) => {
            const newActivePanels = [...prev];
            newActivePanels[index] = !newActivePanels[index];
            return newActivePanels;
        });
    };

    return (
        <>
            <div className="flex flex-col bg-red-500 p-3 text-white">
                <b>MTH231: ELEMENTS OF DISCRETE MATHEMATICS</b>
            </div>
            <Panel
                active={activePanels[0]}
                toggleActive={() => togglePanel(0)}
            />
            <Panel
                active={activePanels[1]}
                toggleActive={() => togglePanel(1)}
            />
            <div className="flex flex-col bg-cyan-500 p-3 text-white">
                <b>ENGR103: ENGINEERING COMPUTATION AND ALGORITHMIC THINKING</b>
            </div>
            <Panel
                active={activePanels[2]}
                toggleActive={() => togglePanel(2)}
            />
            <div className="flex flex-col bg-green-500 p-3 text-white">
                <b>WR121Z: COMPOSITION I</b>
            </div>
            <div className="flex flex-col bg-purple-500 p-3 text-white">
                <b>CS162: INTRODUCTION TO COMPUTER SCIENCE II</b>
            </div>
            <div className="flex flex-col bg-orange-500 p-3 text-white">
                <b>WR121Z: ENGLISH COMPOSITION</b>
            </div>
        </>
    );
};
export default ScheduleAccordion;
