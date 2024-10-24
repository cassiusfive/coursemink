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
    faX,
} from "@fortawesome/free-solid-svg-icons";
import { faBookmark as faRBookmark } from "@fortawesome/free-regular-svg-icons";

import { Section, Timestamp } from "../shared.types";
import { WeekEvent } from "../components/WeeklySchedule";
import ErrorBoundary from "./ErrorBoundary";

import Joyride, { STATUS } from "react-joyride";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { GridLoader } from "react-spinners";

type SectionEventProps = {
    section: Section;
    code: string;
    colorMap: Record<number, string>;
};

const SectionEvent = ({ section, code, colorMap }: SectionEventProps) => {
    const height =
        100 *
        (section.end.hours +
            section.end.minutes / 60 -
            (section.start.hours + section.start.minutes / 60));
    const yOffset = 100 * (section.start.minutes / 60);
    return (
        <div
            className="absolute z-10 flex w-full flex-col justify-between text-nowrap rounded-md px-1.5 text-white"
            style={{
                height: `${height}%`,
                top: `${yOffset}%`,
                backgroundColor: colorMap[section.courseId],
            }}
        >
            <div className="flex justify-between">
                <b>{code}</b>
                <span className="collapse lg:visible">
                    {section.type.split(" ")[0]}
                </span>
            </div>
            <div>{section.professor.name}</div>
        </div>
    );
};

const ScheduleTool = () => {
    const data: FormData = useLocation().state;

    const colorbank: string[] = [
        "#1D3973",
        "#0FBFBF",
        "#F2AE2E",
        "#FF6700",
        "#274434",
        "#BF370C",
    ];

    const colors: Record<number, string> = data.courses.reduce(
        (acc: Record<number, string>, course, index) => {
            acc[course.id] = colorbank[index];
            return acc;
        },
        {}
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const [sections, setSections] = useState<Record<string, Section>>({});
    const [schedules, setSchedules] = useState<string[][]>([]);
    const [scheduleIndex, setScheduleIndex] = useState<number>(0);
    let isInit = false;
    const currentSchedule = schedules[scheduleIndex] || [];
    const events: WeekEvent[] = currentSchedule.map((crn) => {
        const section = sections[crn];
        const code = data.courses.find(
            (course) => course.id == +section.courseId
        )?.code;

        return {
            start: section.start,
            onMonday: section.onMonday,
            onTuesday: section.onTuesday,
            onWednesday: section.onWednesday,
            onThursday: section.onThursday,
            onFriday: section.onFriday,
            children: (
                <SectionEvent
                    section={section}
                    code={code || ""}
                    colorMap={colors}
                />
            ),
        };
    });

    useEffect(() => {
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set("Content-Type", "application/json");
        const fetchSchedules = async () => {
            const prefStartTime: Timestamp = {
                hours: +data.prefStart.slice(0, 2),
                minutes: +data.prefStart.slice(3, 5),
            };
            const res = await fetch(
                import.meta.env.VITE_API_ENDPOINT + "/schedules",
                {
                    method: "POST",
                    headers: requestHeaders,
                    body: JSON.stringify({
                        courses: data.courses.map((course) => course.id),
                        options: { preferredStartTime: prefStartTime },
                    }),
                }
            );
            if (res.ok) {
                const json = await res.json();
                if (json.schedules.length == 0) setError(true);
                setSchedules(json.schedules);
                setSections(json.sections);
                setLoading(false);
            }
        };

        if (!isInit) {
            isInit = true;
            fetchSchedules();
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

    const handleJoyrideCallback = (data: any) => {
        const target = document.querySelector("#schedule-index")!;
        if (STATUS.RUNNING == data.status) {
            disableBodyScroll(target);
        } else {
            localStorage.setItem("tutorial", "false");
            enableBodyScroll(target);
        }
    };

    if (error) {
        return <ErrorBoundary title="No Schedules Found" />;
    }

    if (loading) {
        return (
            <div className=" absolute bottom-0 left-0 right-0 top-0 m-auto flex flex-col justify-center text-center">
                <div className="text-5xl">
                    <b>Finding schedules</b>
                </div>
                <div className="my-10 text-center">
                    <GridLoader size={30} />
                </div>
            </div>
        );
    }

    return (
        <>
            <Joyride
                continuous
                run={JSON.parse(localStorage.getItem("tutorial") || "true")}
                steps={[
                    {
                        content: (
                            <div className="text-2xl">
                                <b>Welcome to Course Mink!</b>
                                <img
                                    src="/mink-working.jpeg"
                                    alt="mink on computer"
                                />
                            </div>
                        ),
                        target: "body",
                        placement: "center",
                    },
                    {
                        content:
                            "On this page you can view a multitude of different schedules ranked based on your preferences.",
                        target: "body",
                        placement: "center",
                    },
                    {
                        content:
                            "This shows the total number of schedules and the current rank of the schedule you're looking at.",
                        target: "#schedule-index",
                    },
                    {
                        content:
                            "This button lets you navigate to the next schedule.",
                        target: "#next-schedule",
                    },
                    {
                        content:
                            "This button displays more information about the current schedule, including professor ratings, location, and availability.",
                        target: "#more-info",
                    },
                    {
                        content:
                            "This button allows you to save the current schedule, which will show up at the top left.",
                        target: "#save-schedule",
                    },
                ]}
                hideCloseButton
                showSkipButton
                showProgress
                disableOverlayClose
                disableCloseOnEsc
                disableScrolling
                callback={handleJoyrideCallback}
                styles={{ options: { primaryColor: "#FF6700" } }}
            />

            {infoActive && (
                <Modal>
                    <div className="flex h-[calc(100%-14rem)] w-9/12 flex-col rounded-md bg-white">
                        <div className="flex items-center bg-stone-500 px-6 text-white">
                            <span className="grow">
                                <b>Schedule Details</b>
                            </span>
                            <button
                                className="p-3"
                                onClick={() => setInfoActive(false)}
                            >
                                <FontAwesomeIcon icon={faX} />
                            </button>
                        </div>
                        <div className="overflow-y-scroll p-5">
                            <ScheduleAccordion
                                schedule={currentSchedule.map(
                                    (crn) => sections[crn]
                                )}
                                courses={data.courses}
                                colorMap={colors}
                            />
                        </div>
                    </div>
                </Modal>
            )}
            <header className="justify-left fixed top-0 z-40 flex min-h-20 w-full items-center bg-stone-500 px-5 align-middle text-white">
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
                            className="px-5 py-2 text-2xl underline hover:text-yellow-300"
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
            <footer className=" fixed bottom-0 z-40 flex min-h-20 w-dvw justify-between bg-stone-500 px-5 align-middle text-white">
                <div className="flex shrink grow basis-0 items-center justify-center text-nowrap text-3xl ">
                    <b className="" id="schedule-index">
                        {scheduleIndex + 1} / {schedules.length}
                    </b>
                </div>
                <div className="flex shrink grow basis-0 items-stretch justify-center">
                    <button
                        className={
                            "mr-5 px-2  transition duration-200 hover:scale-125 active:scale-90 " +
                            (scheduleIndex > 0 ? "" : "collapse")
                        }
                        onClick={() => back()}
                    >
                        <FontAwesomeIcon icon={faBackward} size="3x" />
                    </button>
                    <button
                        className={
                            "ml-5 px-2 transition duration-200 hover:scale-125 active:scale-90 " +
                            (scheduleIndex < schedules.length - 1
                                ? ""
                                : "collapse")
                        }
                        onClick={() => next()}
                    >
                        <FontAwesomeIcon
                            icon={faForward}
                            size="3x"
                            id="next-schedule"
                        />
                    </button>
                </div>
                <div className="flex shrink grow basis-0 items-center justify-evenly text-4xl ">
                    <button
                        className="px-5 transition duration-200 hover:scale-125 active:scale-90"
                        style={{ color: infoActive ? "#7DD3FC" : "" }}
                        onClick={() => setInfoActive(!infoActive)}
                        id="more-info"
                    >
                        <FontAwesomeIcon icon={faInfoCircle} />
                    </button>
                    <button
                        className="px-5 transition duration-200 hover:scale-125 active:scale-90"
                        style={{ color: scheduleSaved ? "#FACC15" : "" }}
                        onClick={() => toggleSaved()}
                        id="save-schedule"
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
