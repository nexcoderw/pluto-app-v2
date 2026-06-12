"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { addMonths } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserSession } from "@/hooks/use-user-session";
import {
	bookingQueryKeys,
	createBooking,
	getListingAvailability,
	type BookingSummary,
	type ListingAvailabilityBlockedRange,
} from "@/services/api/bookings";
import { ApiRequestError } from "@/services/api/errors";
import type { PublicListing } from "@/services/api/listings";
import {
	doesDateRangeOverlapBlockedRange,
	findOverlappingBlockedRange,
	toBookingDateValue,
} from "./listing-booking-date-utils";
import {
	ListingBookingDialog,
	type ListingBookingDialogMode,
} from "./listing-booking-dialog";

type UseListingBookingFlowInput = {
	listing: PublicListing;
	today: Date;
	dateRange: DateRange | undefined;
	fromDate?: Date;
	toDate?: Date;
	durationCount: number;
	durationLabel: string;
	totalPrice: number;
	formattedRange: string;
	onDateRangeChange: (range: DateRange | undefined) => void;
};

type UseListingBookingFlowResult = {
	blockedRanges: ListingAvailabilityBlockedRange[];
	availabilityMessage: string | null;
	selectedBlockedRange?: ListingAvailabilityBlockedRange;
	isAvailabilityLoading: boolean;
	isBookingPending: boolean;
	handleDateRangeChange: (range: DateRange | undefined) => void;
	rejectUnavailableDateRange: (message?: string) => void;
	openBookingDialog: () => void;
	bookingDialog: ReactNode;
};

const unavailableMessage =
	"Those dates are not available for this listing. Choose another available range.";
const ownBookingMessage =
	"You already booked this listing for those dates. Open your customer portal to review or manage that booking.";

export function useListingBookingFlow({
	listing,
	today,
	dateRange,
	fromDate,
	toDate,
	durationCount,
	durationLabel,
	totalPrice,
	formattedRange,
	onDateRangeChange,
}: UseListingBookingFlowInput): UseListingBookingFlowResult {
	const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(
		null,
	);
	const [dialogMode, setDialogMode] =
		useState<ListingBookingDialogMode>("confirm");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [bookingError, setBookingError] = useState<string | undefined>();
	const [booking, setBooking] = useState<BookingSummary | undefined>();
	const currentUser = useUserSession();
	const queryClient = useQueryClient();
	const canSeeUnavailableMessage = Boolean(currentUser);
	const availabilityParams = useMemo(
		() => ({
			startDate: toBookingDateValue(today),
			endDate: toBookingDateValue(addMonths(today, 12)),
		}),
		[today],
	);

	const availabilityQuery = useQuery({
		queryKey: bookingQueryKeys.availability(listing.id, availabilityParams),
		queryFn: () => getListingAvailability(listing.id, availabilityParams),
		staleTime: 30_000,
	});

	const blockedRanges = useMemo(
		() => availabilityQuery.data?.blockedRanges ?? [],
		[availabilityQuery.data?.blockedRanges],
	);
	const selectedBlockedRange = useMemo(
		() => findOverlappingBlockedRange(dateRange, blockedRanges),
		[blockedRanges, dateRange],
	);

	const createBookingMutation = useMutation({
		mutationFn: () => {
			if (!fromDate || !toDate) {
				throw new ApiRequestError({
					message: "Choose valid booking dates before continuing.",
					code: "BOOKING_DATES_REQUIRED",
				});
			}

			return createBooking({
				productId: listing.id,
				startDate: toBookingDateValue(fromDate),
				endDate: toBookingDateValue(toDate),
				quantity: 1,
			});
		},
		onMutate: () => {
			setBookingError(undefined);
			setDialogMode("progress");
		},
		onSuccess: (response) => {
			setBooking(response.booking);
			setDialogMode("success");
			queryClient.setQueryData(bookingQueryKeys.myDetail(response.booking.id), {
				booking: response.booking,
			});
			void queryClient.invalidateQueries({
				queryKey: bookingQueryKeys.myLists(),
			});
			void queryClient.invalidateQueries({
				queryKey: bookingQueryKeys.availabilityLists(),
				predicate: (query) => query.queryKey.includes(listing.id),
			});
		},
		onError: (error) => {
			const message =
				error instanceof ApiRequestError
					? error.message
					: "We could not create this booking. Please try again.";

			setBookingError(message);
			setDialogMode("error");
			void queryClient.invalidateQueries({
				queryKey: bookingQueryKeys.availabilityLists(),
				predicate: (query) => query.queryKey.includes(listing.id),
			});
		},
	});

	useEffect(() => {
		const overlap = findOverlappingBlockedRange(dateRange, blockedRanges);

		if (overlap?.isOwnBooking && canSeeUnavailableMessage) {
			setAvailabilityMessage(buildAvailabilityMessage(overlap));
			return;
		}

		if (overlap) {
			setAvailabilityMessage(
				canSeeUnavailableMessage ? buildAvailabilityMessage(overlap) : null,
			);
			onDateRangeChange(undefined);
		}
	}, [
		blockedRanges,
		canSeeUnavailableMessage,
		dateRange,
		onDateRangeChange,
	]);

	function handleDateRangeChange(nextRange: DateRange | undefined) {
		const overlap = findOverlappingBlockedRange(nextRange, blockedRanges);

		if (overlap?.isOwnBooking && canSeeUnavailableMessage) {
			rejectUnavailableDateRange(buildAvailabilityMessage(overlap));
			onDateRangeChange(nextRange);
			return;
		}

		if (overlap) {
			rejectUnavailableDateRange(
				canSeeUnavailableMessage ? buildAvailabilityMessage(overlap) : null,
			);
			return;
		}

		setAvailabilityMessage(null);
		onDateRangeChange(nextRange);
	}

	function rejectUnavailableDateRange(message: string | null = unavailableMessage) {
		setAvailabilityMessage(canSeeUnavailableMessage ? message : null);
	}

	function openBookingDialog() {
		if (!fromDate || !toDate) {
			setBookingError("Choose your start and end date before booking.");
			setDialogMode("error");
			setIsDialogOpen(true);
			return;
		}

		if (doesDateRangeOverlapBlockedRange(dateRange, blockedRanges)) {
			const overlap = findOverlappingBlockedRange(dateRange, blockedRanges);
			setBookingError(
				canSeeUnavailableMessage
					? buildAvailabilityMessage(overlap)
					: "Sign in to check listing availability and continue booking.",
			);
			setDialogMode("error");
			setIsDialogOpen(true);
			void queryClient.invalidateQueries({
				queryKey: bookingQueryKeys.availabilityLists(),
				predicate: (query) => query.queryKey.includes(listing.id),
			});
			return;
		}

		setBookingError(undefined);
		setBooking(undefined);
		setDialogMode("confirm");
		setIsDialogOpen(true);
	}

	const bookingDialog = (
		<ListingBookingDialog
			open={isDialogOpen}
			mode={dialogMode}
			listingTitle={listing.title}
			formattedRange={formattedRange}
			durationCount={durationCount}
			durationLabel={durationLabel}
			totalPrice={totalPrice}
			currency={listing.currency}
			errorMessage={bookingError}
			booking={booking}
			onOpenChange={setIsDialogOpen}
			onConfirm={() => createBookingMutation.mutate()}
			onRetryDates={() => {
				setIsDialogOpen(false);
				setAvailabilityMessage(
					"Select a fresh date range from the calendar below.",
				);
			}}
		/>
	);

	return {
		blockedRanges,
		availabilityMessage,
		selectedBlockedRange,
		isAvailabilityLoading: availabilityQuery.isPending,
		isBookingPending: createBookingMutation.isPending,
		handleDateRangeChange,
		rejectUnavailableDateRange,
		openBookingDialog,
		bookingDialog,
	};
}

function buildAvailabilityMessage(
	blockedRange?: ListingAvailabilityBlockedRange,
): string {
	if (!blockedRange?.isOwnBooking) {
		return unavailableMessage;
	}

	return blockedRange.bookingNo
		? `${ownBookingMessage} Booking ${blockedRange.bookingNo} covers the selected dates.`
		: ownBookingMessage;
}
