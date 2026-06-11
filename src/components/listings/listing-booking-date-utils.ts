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
	return Boolean(findOverlappingBlockedRange(range, blockedRanges));
}

export function findOverlappingBlockedRange(
	range: DateRange | undefined,
	blockedRanges: ListingAvailabilityBlockedRange[],
): ListingAvailabilityBlockedRange | undefined {
	if (!range?.from || !range.to || blockedRanges.length === 0) {
		return undefined;
	}

	const rangeStart = getDayTime(range.from);
	const rangeEnd = getDayTime(range.to);

	const overlappingRanges = blockedRanges
		.filter((blockedRange) => blockedRange.blocksBooking !== false)
		.filter((blockedRange) => doRangesOverlap(rangeStart, rangeEnd, blockedRange));

	return (
		overlappingRanges.find((blockedRange) => blockedRange.isOwnBooking) ??
		overlappingRanges[0]
	);
}

export function mapBlockedRangesToCalendarMatchers(
	blockedRanges: ListingAvailabilityBlockedRange[],
) {
	return blockedRanges
		.filter((blockedRange) => blockedRange.blocksBooking !== false)
		.map((blockedRange) => ({
			from: startOfDay(parseISO(blockedRange.startDate)),
			to: startOfDay(parseISO(blockedRange.endDate)),
		}));
}

export function mapBookedMarkerRangesToCalendarMatchers(
	blockedRanges: ListingAvailabilityBlockedRange[],
) {
	return blockedRanges.filter((blockedRange) => blockedRange.showBookedMarker).map((blockedRange) => ({
		from: startOfDay(parseISO(blockedRange.startDate)),
		to: startOfDay(parseISO(blockedRange.endDate)),
	}));
}

function getDayTime(date: Date): number {
	return startOfDay(date).getTime();
}

function doRangesOverlap(
	rangeStart: number,
	rangeEnd: number,
	blockedRange: ListingAvailabilityBlockedRange,
): boolean {
	const blockedStart = getDayTime(parseISO(blockedRange.startDate));
	const blockedEnd = getDayTime(parseISO(blockedRange.endDate));

	return rangeStart <= blockedEnd && rangeEnd >= blockedStart;
}
