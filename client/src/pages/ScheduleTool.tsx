import { useLocation } from "react-router-dom";
import { FormData } from "./ScheduleForm";
import { useState, useEffect } from "react";

import WeeklySchedule from "../components/WeeklySchedule";
import Modal from "../components/Modal";
import ScheduleAccordion from "../components/ScheduleAccordion";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faForward,
    faBackward,
    faBookmark,
    faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faBookmark as faRBookmark } from "@fortawesome/free-regular-svg-icons";
import { Section } from "../shared.types";
import { WeekEvent } from "../components/WeeklySchedule";

type SectionEventProps = {
    section: Section;
};

const SectionEvent = ({ section }: SectionEventProps) => {
    const height =
        100 *
        (section.end.hours +
            section.end.minutes / 60 -
            (section.start.hours + section.start.minutes / 60));
    return (
        <div
            className="h-full bg-red-400"
            style={{
                height: `${height}%`,
            }}
        >
            Testing
        </div>
    );
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

    const [sections, setSections] = useState<Record<string, Section>>({});
    const [schedules, setSchedules] = useState<string[][]>([]);
    const [scheduleIndex, setScheduleIndex] = useState<number>(0);
    let isInit = false;
    const currentSchedule = schedules[scheduleIndex] || [];
    const events: WeekEvent[] = currentSchedule.map((crn) => {
        const section = sections[crn];
        return {
            start: section.start,
            onMonday: section.onMonday,
            onTuesday: section.onTuesday,
            onWednesday: section.onWednesday,
            onThursday: section.onThursday,
            onFriday: section.onFriday,
            children: <SectionEvent section={section} />,
        };
    });

    console.log(events);

    useEffect(() => {
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set("Content-Type", "application/json");
        const fetchSchedules = async () => {
            const res = await fetch(
                import.meta.env.VITE_API_ENDPOINT + "/schedules",
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
                console.log(json);
                setSchedules(json.schedules);
                setSections(json.sections);
            }
        };

        if (!isInit) {
            isInit = true;
            fetchSchedules().catch(console.error);
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

    const [infoActive, setInfoActive] = useState<boolean>(false);

    const [savedSchedules, setSavedSchedules] = useState<number[]>([]);
    const scheduleSaved = savedSchedules.includes(scheduleIndex);

    const toggleSaved = () => {
        if (!scheduleSaved) {
            setSavedSchedules(
                [scheduleIndex, ...savedSchedules].sort((a, b) => a - b)
            );
        } else {
            setSavedSchedules(
                savedSchedules.filter((i) => {
                    return i != scheduleIndex;
                })
            );
        }
    };

    return (
        <>
            {infoActive && (
                <Modal>
                    <div className="flex h-[calc(100%-14rem)] w-9/12 flex-col rounded-md bg-white">
                        <div className="flex bg-stone-700 p-4 text-white">
                            <span className="grow">Schedule Details</span>
                            <button
                                className="px-4"
                                onClick={() => setInfoActive(false)}
                            >
                                x
                            </button>
                        </div>
                        <div className="overflow-y-scroll p-5">
                            <ScheduleAccordion />
                        </div>
                    </div>
                </Modal>
            )}
            <header className="justify-left fixed top-0 z-40 flex min-h-20 w-full items-center bg-neutral-800 px-5 align-middle text-white">
                <span className="px-5">
                    <b>
                        {savedSchedules.length
                            ? "Saved:"
                            : "Saved schedules will show up here"}
                    </b>
                </span>
                {savedSchedules.map((id) => {
                    return (
                        <button
                            className="px-5 py-2 text-2xl  underline hover:text-yellow-300"
                            onClick={() => {
                                setScheduleIndex(id);
                            }}
                        >
                            <b>#{id + 1}</b>
                        </button>
                    );
                })}
            </header>
            <div className="my-28 px-10">
                <WeeklySchedule events={events} />
            </div>
            <footer className="fixed bottom-0 z-40 flex min-h-20 w-dvw justify-between bg-neutral-800 px-5 align-middle">
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
                <div className="flex shrink grow basis-0 items-center justify-evenly text-4xl text-white">
                    <button
                        className="px-5 transition duration-200 hover:scale-125 active:scale-90"
                        style={{ color: infoActive ? "#93C5FD" : "" }}
                        onClick={() => setInfoActive(!infoActive)}
                    >
                        <FontAwesomeIcon icon={faInfoCircle} />
                    </button>
                    <button
                        className="px-5 transition duration-200 hover:scale-125 active:scale-90"
                        style={{ color: scheduleSaved ? "#FDE047" : "" }}
                        onClick={() => toggleSaved()}
                    >
                        <FontAwesomeIcon
                            icon={scheduleSaved ? faBookmark : faRBookmark}
                        />
                    </button>
                </div>
            </footer>
        </>
    );
};
export default ScheduleTool;
