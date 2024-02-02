import { Schedule, SectionEvent } from "../pages/ScheduleTool";

type TimeLabelProps = {
    time: number;
};

const TimeLabel = ({ time }: TimeLabelProps) => {
    const period = time < 12 ? "AM" : "PM";
    return (
        <div className="relative top-[-0.75rem] text-nowrap px-2 text-right">
            {time === 12
                ? "Noon"
                : (time <= 12 ? time : time - 12).toString() + " " + period}
        </div>
    );
};

type WeeklyScheduleProps = {
    colors: Record<number, string>;
    schedule: Schedule;
};

const WeeklySchedule = ({ colors, schedule }: WeeklyScheduleProps) => {
    const startHour = 8;
    const endHour = 22;

    type EventColumnProps = {
        events: SectionEvent[];
        colors: Record<number, string>;
    };

    const EventColumn = ({ events, colors }: EventColumnProps) => {
        return (
            <ul className="h-full w-full">
                <div className="relative top-0 z-10 box-border flex h-full w-full flex-col justify-between">
                    {[...Array(endHour - startHour).keys()].map((i) => {
                        const section = events.find((section) => {
                            return section.start === startHour + i;
                        });
                        return (
                            <div
                                key={i}
                                className="relative box-border h-full min-h-16 w-full flex-grow basis-0 border-b"
                            >
                                {section && (
                                    <div
                                        className={
                                            "absolute z-30 flex w-full rounded-md text-white " +
                                            colors[section.courseId]
                                        }
                                        style={{
                                            height: `${section.length * 100}%`,
                                        }}
                                    >
                                        <div className="flex h-full w-full grow flex-col justify-between overflow-clip">
                                            <div className="flex justify-between">
                                                <div className="px-2">
                                                    <b>
                                                        {section.courseCode.toUpperCase()}
                                                    </b>
                                                </div>
                                                <div className="invisible truncate text-nowrap px-2 pb-1 text-right lg:visible">
                                                    {section.type.toUpperCase()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="w-full text-wrap px-2 text-left">
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
        <div className="relative h-full w-full">
            <div className="flex h-full w-full justify-between">
                <section className="flex basis-0 flex-col px-0">
                    <div className="box-border py-2 pr-2  text-center">
                        &nbsp;
                    </div>
                    <ul className="relative flex h-full w-full flex-col">
                        {[...Array(endHour - startHour).keys()].map((i) => {
                            return (
                                <li key={i} className="relative grow">
                                    <TimeLabel time={startHour + i} />
                                </li>
                            );
                        })}
                    </ul>
                </section>
                <section className="flex grow basis-0 flex-col border-l border-r px-0">
                    <div className="sticky top-28 z-30 box-border border-b bg-white py-2 text-center">
                        Monday
                    </div>
                    <EventColumn events={schedule.monday} colors={colors} />
                </section>
                <section className="flex grow basis-0 flex-col border-l border-r px-0">
                    <div className="sticky top-28 z-30 box-border border-b bg-white py-2 text-center">
                        Tuesday
                    </div>
                    <EventColumn events={schedule.tuesday} colors={colors} />
                </section>
                <section className="flex grow basis-0 flex-col border-l border-r px-0">
                    <div className="sticky top-28 z-30 box-border border-b bg-white py-2 text-center">
                        Wednesday
                    </div>
                    <EventColumn events={schedule.wednesday} colors={colors} />
                </section>
                <section className="flex grow basis-0 flex-col border-l border-r px-0">
                    <div className="sticky top-28 z-30 box-border border-b bg-white py-2 text-center">
                        Thursday
                    </div>
                    <EventColumn events={schedule.thursday} colors={colors} />
                </section>
                <section className="flex grow basis-0 flex-col border-l border-r px-0">
                    <div className="sticky top-28 z-30 box-border border-b bg-white py-2 text-center">
                        Friday
                    </div>
                    <EventColumn events={schedule.friday} colors={colors} />
                </section>
            </div>
        </div>
    );
};
export default WeeklySchedule;
