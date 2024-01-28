import { useState, useEffect, useRef } from "react";
import { Schedule, SectionEvent } from "../pages/ScheduleTool";

type TimeLabelProps = {
    time: number;
};

const TimeLabel = ({ time }: TimeLabelProps) => {
    const period = time < 12 ? "AM" : "PM";
    return (
        <div className="px-2 text-right relative top-[-0.75rem] text-nowrap">
            {time === 12
                ? "NOON"
                : (time <= 12 ? time : time - 12).toString() + ":00 " + period}
        </div>
    );
};

type WeeklyScheduleProps = {
    colors: Record<number, string>;
    schedule: Schedule;
};

const WeeklySchedule = ({ colors, schedule }: WeeklyScheduleProps) => {
    const startHour = 8;
    const endHour = 20;

    const [rowHeight, setRowHeight] = useState<number>(0);
    const ulRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            if (ulRef.current) {
                if (Math.abs(ulRef.current.clientHeight - rowHeight) > 10) {
                    setRowHeight(
                        ulRef.current.clientHeight / (endHour - startHour)
                    );
                }
            }
        };

        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    });

    type EventColumnProps = {
        events: SectionEvent[];
        colors: Record<number, string>;
    };

    const EventColumn = ({ events, colors }: EventColumnProps) => {
        return (
            <ul className="w-full h-full">
                <div
                    ref={ulRef}
                    className="relative z-10 w-full h-full flex flex-col justify-between box-border top-0"
                >
                    {[...Array(endHour - startHour).keys()].map((i) => {
                        const section = events.find((section) => {
                            return section.start === startHour + i;
                        });
                        return (
                            <div
                                key={i}
                                className="w-full h-full border-b box-border flex-grow basis-0 min-h-16"
                            >
                                {section && (
                                    <div
                                        className={
                                            "flex rounded-md text-white absolute w-full " +
                                            colors[section.courseId]
                                        }
                                        style={{
                                            height: rowHeight * section.length,
                                        }}
                                    >
                                        <div className="flex flex-col justify-between grow">
                                            <div className="flex justify-between">
                                                <div className="px-2">
                                                    <b>
                                                        {section.courseCode.toUpperCase()}
                                                    </b>
                                                </div>
                                                <div className="px-2 pb-1 text-right">
                                                    {section.type.toUpperCase()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="px-2 text-left text-nowrap">
                                                    {section.professor}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </ul>
        );
    };

    return (
        <div className="w-full h-full relative">
            <div className="flex justify-between w-full h-full">
                <section className="px-0 basis-0 flex flex-col">
                    <div className="text-center box-border py-2">&nbsp;</div>
                    <ul className="relative w-full h-full flex flex-col">
                        {[...Array(endHour - startHour).keys()].map((i) => {
                            return (
                                <li key={i} className="grow relative">
                                    <TimeLabel time={startHour + i} />
                                </li>
                            );
                        })}
                    </ul>
                </section>
                <section className="px-0 basis-0 grow border-l border-r flex flex-col">
                    <div className="text-center border-b box-border py-2">
                        Monday
                    </div>
                    <EventColumn events={schedule.monday} colors={colors} />
                </section>
                <section className="px-0 basis-0 grow border-l border-r flex flex-col">
                    <div className="text-center border-b box-border py-2">
                        Tuesday
                    </div>
                    <EventColumn events={schedule.tuesday} colors={colors} />
                </section>
                <section className="px-0 basis-0 grow border-l border-r flex flex-col">
                    <div className="text-center border-b box-border py-2">
                        Wednesday
                    </div>
                    <EventColumn events={schedule.wednesday} colors={colors} />
                </section>
                <section className="px-0 basis-0 grow border-l border-r flex flex-col">
                    <div className="text-center border-b box-border py-2">
                        Thursday
                    </div>
                    <EventColumn events={schedule.thursday} colors={colors} />
                </section>
                <section className="px-0 basis-0 grow border-l border-r flex flex-col">
                    <div className="text-center border-b box-border py-2">
                        Friday
                    </div>
                    <EventColumn events={schedule.friday} colors={colors} />
                </section>
            </div>
        </div>
    );
};
export default WeeklySchedule;
