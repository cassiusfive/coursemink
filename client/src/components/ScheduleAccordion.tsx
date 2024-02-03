import { useState } from "react";

import { Schedule } from "../pages/ScheduleTool";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

type PanelProps = {
    active: boolean;
    toggleActive: () => void;
};

const SectionDetails = () => {};

const Panel = ({ active, toggleActive }: PanelProps) => {
    const rotation = active ? "rotate-90" : "rotate-0";
    const hide = active ? "max-h-20" : "max-h-0";
    return (
        <>
            <button
                className="flex w-full items-center bg-stone-200 p-2 px-4 transition duration-200 hover:bg-stone-300"
                onClick={toggleActive}
            >
                <FontAwesomeIcon
                    icon={faArrowRight}
                    className={"transition duration-150 " + rotation}
                ></FontAwesomeIcon>
                <span className="px-4">MTW Lecture</span>
            </button>
            <div
                className={
                    "transition-max-height overflow-clip duration-200 " + hide
                }
            >
                <div>test</div>
                <div>meow</div>
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
