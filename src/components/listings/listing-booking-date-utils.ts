import { format, parseISO, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { ListingAvailabilityBlockedRange } from "@/services/api/bookings";

export function toBookingDateValue(date: Date): string {
	return format(date, "yyyy-MM-dd");
}

export function doesDateRangeOverlapBlockedRange(
	range: DateRange | undefined,
	blockedRanges: ListingAvailabilityBlockedRange[],
): boolean {
	if (!range?.from || !range.to || blockedRanges.length === 0) {
		return false;
	}

	const rangeStart = getDayTime(range.from);
	const rangeEnd = getDayTime(range.to);

	return blockedRanges.some((blockedRange) => {
		const blockedStart = getDayTime(parseISO(blockedRange.startDate));
		const blockedEnd = getDayTime(parseISO(blockedRange.endDate));

		return rangeStart <= blockedEnd && rangeEnd >= blockedStart;
	});
}

export function mapBlockedRangesToCalendarMatchers(
	blockedRanges: ListingAvailabilityBlockedRange[],
) {
	return blockedRanges.map((blockedRange) => ({
		from: startOfDay(parseISO(blockedRange.startDate)),
		to: startOfDay(parseISO(blockedRange.endDate)),
	}));
}

function getDayTime(date: Date): number {
	return startOfDay(date).getTime();
}
