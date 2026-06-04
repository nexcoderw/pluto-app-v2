"use client";

import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./listing-date-planner.module.css";

type ListingDatePlannerProps = {
	eyebrow: string;
	formattedRange: string;
	fromLabel: string;
	toLabel: string;
	today: Date;
	dateRange: DateRange | undefined;
	fromDate?: Date;
	toDate?: Date;
	resetRange: DateRange;
	onDateRangeChange: (range: DateRange | undefined) => void;
};

export function ListingDatePlanner({
	eyebrow,
	formattedRange,
	fromLabel,
	toLabel,
	today,
	dateRange,
	fromDate,
	toDate,
	resetRange,
	onDateRangeChange,
}: ListingDatePlannerProps) {
	return (
		<section className={styles.planner}>
			<div className={styles.header}>
				<div>
					<span>
						<CalendarDays aria-hidden="true" />
						{eyebrow}
					</span>
					<p>{formattedRange}</p>
				</div>
				<div className={styles.preview}>
					<div>
						<span>{fromLabel}</span>
						<strong>
							{fromDate ? format(fromDate, "M/d/yyyy") : "Add date"}
						</strong>
					</div>
					<div>
						<span>{toLabel}</span>
						<strong>{toDate ? format(toDate, "M/d/yyyy") : "Add date"}</strong>
					</div>
				</div>
			</div>

			<div className={styles.calendarShell}>
				<Calendar
					mode="range"
					numberOfMonths={2}
					selected={dateRange}
					onSelect={onDateRangeChange}
					disabled={{ before: today }}
					className={styles.calendar}
					showOutsideDays={false}
				/>
			</div>

			<button
				type="button"
				className={styles.clearDatesButton}
				onClick={() => onDateRangeChange(resetRange)}
			>
				Clear dates
			</button>
		</section>
	);
}

export function ListingDatePlannerSkeleton() {
	return (
		<section className={styles.planner} aria-busy="true">
			<div className={styles.header}>
				<div>
					<Skeleton className={styles.skeletonSectionLabel} />
					<Skeleton className={styles.skeletonDateText} />
				</div>
				<div className={styles.preview}>
					<div>
						<Skeleton className={styles.skeletonMiniLine} />
						<Skeleton className={styles.skeletonDateValue} />
					</div>
					<div>
						<Skeleton className={styles.skeletonMiniLine} />
						<Skeleton className={styles.skeletonDateValue} />
					</div>
				</div>
			</div>
			<div className={styles.calendarShell}>
				<div className={styles.skeletonCalendar}>
					{Array.from({ length: 2 }).map((_, monthIndex) => (
						<div key={monthIndex} className={styles.skeletonMonth}>
							<Skeleton className={styles.skeletonMonthTitle} />
							<div className={styles.skeletonWeekdays}>
								{Array.from({ length: 7 }).map((__, index) => (
									<Skeleton key={index} />
								))}
							</div>
							<div className={styles.skeletonDays}>
								{Array.from({ length: 35 }).map((__, index) => (
									<Skeleton key={index} />
								))}
							</div>
						</div>
					))}
				</div>
			</div>
			<Skeleton className={styles.skeletonClearDates} />
		</section>
	);
}
