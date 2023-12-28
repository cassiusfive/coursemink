import React from "react";
import { Section } from "./shared.types";
import styles from "./WeeklyCalendar.module.css";

interface WeeklyCalendarProps {
	sections: Record<string, Record<string, Section[]>>
}

interface HourMap {
	hour: Record<number, string>
}

function hourToLabel(hour: number): string {
	if (hour < 12) {
		return `${hour} AM`;
	} else if (hour > 12) {
		return `${hour - 12} PM`;
	}
	return "NOON";
}

export const WeeklyCalendar = ({ sections }: WeeklyCalendarProps) => {
	const startHour = 8;
	const endHour = 19;

	for (const course in sections) {
		for (const type in sections[course]) {

		}
	}

	const rows = [];
	for (let hour = startHour; hour < endHour; hour++) {
		rows.push(<>
			<div className={styles.hourLabelContainer}>
				<div className={styles.hourLabel}>{hourToLabel(hour)}</div>
			</div>
			<div className={styles.hourSlot}></div>
			<div className={styles.hourSlot}></div>
			<div className={styles.hourSlot}></div>
			<div className={styles.hourSlot}></div>
			<div className={styles.hourSlot}></div>
		</>)
	}
	rows.push(<div className={styles.hourLabelContainer}>
		<div className={styles.hourLabel}>{hourToLabel(endHour)}</div>
	</div>)

	return <div className={styles.calendar}>
		<div></div>
		<div className={styles.dayLabel}>MONDAY</div>
		<div className={styles.dayLabel}>TUEDAY</div>
		<div className={styles.dayLabel}>WEDNESDAY</div>
		<div className={styles.dayLabel}>THURSDAY</div>
		<div className={styles.dayLabel}>FRIDAY</div>
		{...rows}
	</div>
}