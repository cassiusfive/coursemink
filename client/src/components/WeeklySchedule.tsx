import { useState, useEffect, useRef } from "react";

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
};

const WeeklySchedule = ({ colors }: WeeklyScheduleProps) => {
    const startHour = 8;
    const endHour = 16;

    const INITIAL_DATA: any = {
        monday: [
            {
                course_id: 1448,
                code: "MTH254",
                section: "005",
                timerange: "2:00pm-2:50pm",
                start: 14,
                length: 5 / 6,
                type: "Lecture",
                professor: "Chris Orum",
            },
            {
                course_id: 808,
                code: "ENGR102",
                section: "010",
                timerange: "1:00pm-1:50pm",
                start: 13,
                length: 5 / 6,
                type: "Lecture",
                professor: "Jason Clark",
            },
        ],
    };

    const [schedule, setSchedule] = useState<any>(INITIAL_DATA);
    const [rowHeight, setRowHeight] = useState<number>(0);
    const rowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            if (rowRef.current) {
                if (Math.abs(rowRef.current.clientHeight - rowHeight) > 1) {
                    setRowHeight(rowRef.current.clientHeight);
                }
            }
        };

        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    });

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
                    <ul className="relative w-full h-full">
                        <div className="absolute z-10 w-full h-full flex flex-col justify-between box-border top-0">
                            {[...Array(endHour - startHour).keys()].map((i) => {
                                const section = schedule.monday.find(
                                    (section: any) =>
                                        section.start === i + startHour
                                );
                                return (
                                    <div
                                        key={i}
                                        className="w-full h-full border-b box-border"
                                        ref={rowRef}
                                    >
                                        {section && (
                                            <div
                                                className={
                                                    "flex rounded-md text-white " +
                                                    colors[section.course_id]
                                                }
                                                style={{
                                                    height:
                                                        rowHeight *
                                                        section.length,
                                                }}
                                            >
                                                <div className="flex flex-col justify-between grow">
                                                    <div className="px-2">
                                                        {section.code.toUpperCase()}
                                                    </div>
                                                    <div className="px-2 text-left text-nowrap">
                                                        <b>
                                                            {section.professor}
                                                        </b>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="px-2 pb-1 text-right">
                                                        {section.type.toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ul>
                </section>
                <section className="px-2 basis-0 grow border-r">
                    <div className="text-center">Tuesday</div>
                </section>
                <section className="px-2 basis-0 grow border-r">
                    <div className="text-center">Wednesday</div>
                </section>
                <section className="px-2 basis-0 grow border-r">
                    <div className="text-center">Thursday</div>
                </section>
                <section className="px-2 basis-0 grow border-r">
                    <div className="text-center">Friday</div>
                </section>
            </div>
        </div>
    );
};
export default WeeklySchedule;
