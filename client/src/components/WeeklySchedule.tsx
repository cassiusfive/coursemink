import { Timestamp } from "../shared.types";

const STARTHOUR = 8;
const ENDHOUR = 22;

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

export type WeekEvent = {
    start: Timestamp;
    onMonday: boolean;
    onTuesday: boolean;
    onWednesday: boolean;
    onThursday: boolean;
    onFriday: boolean;
    children: React.ReactNode;
};

type WeeklyScheduleProps = {
    events: WeekEvent[];
};

const WeeklySchedule = ({ events }: WeeklyScheduleProps) => {
    return (
        <div className="relative h-full w-full">
            <div className="flex h-full w-full justify-between">
                <section className="flex basis-0 flex-col px-0">
                    <div className="box-border py-2 pr-2  text-center">
                        &nbsp;
                    </div>
                    <ul className="relative flex h-full w-full flex-col">
                        {[...Array(ENDHOUR - STARTHOUR).keys()].map((i) => {
                            return (
                                <li key={i} className="relative grow">
                                    <TimeLabel time={STARTHOUR + i} />
                                </li>
                            );
                        })}
                    </ul>
                </section>
                <section className="flex grow basis-0 flex-col border-l border-r px-0">
                    <div className="sticky top-20 z-30 box-border border-b bg-white py-2 text-center">
                        Monday
                    </div>
                    <EventColumn
                        events={events.filter((event) => event.onMonday)}
                    />
                </section>
                <section className="flex grow basis-0 flex-col border-l border-r px-0">
                    <div className="sticky top-20 z-30 box-border border-b bg-white py-2 text-center">
                        Tuesday
                    </div>
                    <EventColumn
                        events={events.filter((event) => event.onTuesday)}
                    />
                </section>
                <section className="flex grow basis-0 flex-col border-l border-r px-0">
                    <div className="sticky top-20 z-30 box-border border-b bg-white py-2 text-center">
                        Wednesday
                    </div>
                    <EventColumn
                        events={events.filter((event) => event.onWednesday)}
                    />
                </section>
                <section className="flex grow basis-0 flex-col border-l border-r px-0">
                    <div className="sticky top-20 z-30 box-border border-b bg-white py-2 text-center">
                        Thursday
                    </div>
                    <EventColumn
                        events={events.filter((event) => event.onThursday)}
                    />
                </section>
                <section className="flex grow basis-0 flex-col border-l border-r px-0">
                    <div className="sticky top-20 z-30 box-border border-b bg-white py-2 text-center">
                        Friday
                    </div>
                    <EventColumn
                        events={events.filter((event) => event.onFriday)}
                    />
                </section>
            </div>
        </div>
    );
};
export default WeeklySchedule;

type EventColumnProps = {
    events: WeekEvent[];
};

const EventColumn = ({ events }: EventColumnProps) => {
    return (
        <ul className="h-full w-full">
            <div className="relative top-0 flex h-full w-full flex-col justify-between">
                {[...Array(ENDHOUR - STARTHOUR).keys()].map((i) => {
                    const section = events.find((section) => {
                        return section.start.hours === STARTHOUR + i;
                    });
                    return (
                        <div
                            key={i}
                            className="relative h-full min-h-16 w-full flex-grow basis-0 border-b"
                        >
                            {section?.children}
                        </div>
                    );
                })}
            </div>
        </ul>
    );
};

type SkeletonEventOptions = Omit<WeekEvent, "children"> & {
    end: Timestamp;
};

export const SkeletonEvent = (params: SkeletonEventOptions): WeekEvent => {
    const height =
        100 *
        (params.end.hours +
            params.end.minutes / 60 -
            (params.start.hours + params.start.minutes / 60));
    const skeleton = (
        <div
            className="absolute z-10 flex w-full flex-col justify-between text-nowrap rounded-md bg-stone-500 p-2"
            style={{
                height: `${height}%`,
            }}
        >
            <div className="flex animate-pulse justify-between ">
                <div className="h-2.5 w-14 rounded-full bg-stone-300" />
                <div className="h-2 w-14 rounded-full bg-stone-300" />
            </div>
            <div className="animate-pulse">
                <div className="h-2 w-24 rounded-full bg-stone-300" />
            </div>
        </div>
    );
    return {
        ...params,
        children: skeleton,
    };
};
