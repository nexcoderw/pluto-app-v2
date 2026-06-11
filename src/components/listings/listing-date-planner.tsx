"use client";

import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import type { ListingAvailabilityBlockedRange } from "@/services/api/bookings";
import {
	doesDateRangeOverlapBlockedRange,
	findOverlappingBlockedRange,
	mapBlockedRangesToCalendarMatchers,
} from "./listing-booking-date-utils";
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
	blockedRanges?: ListingAvailabilityBlockedRange[];
	availabilityMessage?: string | null;
	onUnavailableSelection?: (message: string) => void;
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
	blockedRanges = [],
	availabilityMessage,
	onUnavailableSelection,
	onDateRangeChange,
}: ListingDatePlannerProps) {
	const disabledRanges = mapBlockedRangesToCalendarMatchers(blockedRanges);
	const selectedBlockedRange = findOverlappingBlockedRange(
		dateRange,
		blockedRanges,
	);

	function handleDateRangeChange(range: DateRange | undefined) {
		if (doesDateRangeOverlapBlockedRange(range, blockedRanges)) {
			onUnavailableSelection?.(
				buildCalendarUnavailableMessage(
					findOverlappingBlockedRange(range, blockedRanges),
				),
			);
			return;
		}

		onDateRangeChange(range);
	}

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
					onSelect={handleDateRangeChange}
					disabled={[{ before: today }, ...disabledRanges]}
					excludeDisabled
					className={styles.calendar}
					showOutsideDays={false}
				/>
			</div>
			{availabilityMessage ? (
				<p
					className={styles.availabilityMessage}
					data-own-booking={Boolean(selectedBlockedRange?.isOwnBooking)}
				>
					{availabilityMessage}
				</p>
			) : null}

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

function buildCalendarUnavailableMessage(
	blockedRange?: ListingAvailabilityBlockedRange,
): string {
	if (blockedRange?.isOwnBooking) {
		return blockedRange.bookingNo
			? `You already booked this listing for those dates. Booking ${blockedRange.bookingNo} is available in your customer portal.`
			: "You already booked this listing for those dates. Open your customer portal to review or manage it.";
	}

	return "Those dates are not available for this listing. Choose another available range.";
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
