"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { addMonths } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserSession } from "@/hooks/use-user-session";
import {
	bookingQueryKeys,
	getListingAvailability,
	type ListingAvailabilityBlockedRange,
} from "@/services/api/bookings";
import {
	BOOKING_AVAILABILITY_STALE_TIME_MS,
	BOOKING_QUERY_GC_TIME_MS,
	shouldRetryBookingQuery,
} from "@/services/api/bookings/query-options";
import { ApiRequestError } from "@/services/api/errors";
import type { PublicListing } from "@/services/api/listings";
import {
	createCheckout,
	createListingQuote,
	getPaymentIntent,
	initiatePaymentAttempt,
	reconcilePaymentIntent,
	type CheckoutSession,
	type PaymentAction,
	type PaymentIntent,
	type PaymentMethod,
	type PaymentNetwork,
	type PriceQuote,
} from "@/services/api/payments";
import { paymentQueryKeys } from "@/services/api/payments/query-keys";
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
	rejectUnavailableDateRange: (message?: string | null) => void;
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
		useState<ListingBookingDialogMode>("quote-loading");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [checkoutError, setCheckoutError] = useState<string>();
	const [supportReference, setSupportReference] = useState<string>();
	const [quote, setQuote] = useState<PriceQuote>();
	const [rateChangedFrom, setRateChangedFrom] = useState<string>();
	const [checkout, setCheckout] = useState<CheckoutSession>();
	const [payment, setPayment] = useState<PaymentIntent>();
	const [paymentAction, setPaymentAction] = useState<PaymentAction>();
	const quoteKeyRef = useRef<string | undefined>(undefined);
	const checkoutKeyRef = useRef<string | undefined>(undefined);
	const attemptKeyRef = useRef<string | undefined>(undefined);
	const paymentIntentIdRef = useRef<string | undefined>(undefined);
	const paymentSubmissionRef = useRef(false);
	const previousRateRef = useRef<string | undefined>(undefined);
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
		staleTime: BOOKING_AVAILABILITY_STALE_TIME_MS,
		gcTime: BOOKING_QUERY_GC_TIME_MS,
		retry: shouldRetryBookingQuery,
		refetchOnReconnect: true,
	});
	const blockedRanges = useMemo(
		() => availabilityQuery.data?.blockedRanges ?? [],
		[availabilityQuery.data?.blockedRanges],
	);
	const selectedBlockedRange = useMemo(
		() => findOverlappingBlockedRange(dateRange, blockedRanges),
		[blockedRanges, dateRange],
	);

	const quoteMutation = useMutation({
		mutationFn: () => {
			if (!fromDate || !toDate) {
				throw new ApiRequestError({
					message: "Choose valid booking dates before continuing.",
					code: "BOOKING_DATES_REQUIRED",
				});
			}

			return createListingQuote({
				productId: listing.id,
				startDate: toBookingDateValue(fromDate),
				endDate: toBookingDateValue(toDate),
				quantity: 1,
				idempotencyKey: getRequestKey(quoteKeyRef, "quote"),
			});
		},
		onMutate: () => {
			setCheckoutError(undefined);
			setSupportReference(undefined);
			setDialogMode("quote-loading");
		},
		onSuccess: (response) => {
			const previousRate = previousRateRef.current;
			setRateChangedFrom(
				previousRate &&
					response.quote.exchangeRateValue &&
					previousRate !== response.quote.exchangeRateValue
					? previousRate
					: undefined,
			);
			previousRateRef.current = undefined;
			setQuote(response.quote);
			setDialogMode("quote");
			void queryClient.invalidateQueries({
				queryKey: bookingQueryKeys.availabilityLists(),
			});
		},
		onError: (error) => {
			applyCheckoutError(error, "We could not reserve these dates.");
			setDialogMode(isExpiredError(error) ? "expired" : "error");
			void queryClient.invalidateQueries({
				queryKey: bookingQueryKeys.availabilityLists(),
			});
		},
	});

	const paymentMutation = useMutation({
		mutationFn: async (input: {
			method: PaymentMethod;
			network?: PaymentNetwork;
			phoneNumber: string;
		}) => {
			if (!quote) {
				throw new ApiRequestError({
					message: "Request a fresh secure quote before payment.",
					code: "QUOTE_REQUIRED",
				});
			}

			const activeCheckout =
				checkout ??
				(
					await createCheckout({
						priceQuoteId: quote.id,
						acceptedTermsVersion: quote.termsVersion,
						idempotencyKey: getRequestKey(checkoutKeyRef, "checkout"),
					})
				).checkout;
			setCheckout(activeCheckout);
			paymentIntentIdRef.current = activeCheckout.paymentIntent.id;

			const idempotencyKey = getRequestKey(attemptKeyRef, "attempt");
			return initiatePaymentAttempt(
				activeCheckout.paymentIntent.id,
				input.method === "CARD"
					? {
							method: "CARD",
							phoneNumber: input.phoneNumber,
							idempotencyKey,
						}
					: {
							method: "MOBILE_MONEY",
							network: input.network ?? "MTN_MOMO",
							phoneNumber: input.phoneNumber,
							idempotencyKey,
						},
			);
		},
		onMutate: () => {
			setCheckoutError(undefined);
			setSupportReference(undefined);
			setDialogMode("payment-submitting");
		},
		onSuccess: (response) => {
			setPaymentAction(response.paymentAction);
			applyPayment(response.payment);
		},
		onError: async (error) => {
			const paymentIntentId = paymentIntentIdRef.current;
			if (paymentIntentId) {
				try {
					const response = await getPaymentIntent(paymentIntentId);
					applyPayment(response.payment);
					return;
				} catch {
					// The safe API error below remains the primary recovery guidance.
				}
			}

			applyCheckoutError(error, "Payment could not be started safely.");
			setDialogMode(isExpiredError(error) ? "expired" : "error");
		},
		onSettled: () => {
			paymentSubmissionRef.current = false;
		},
	});

	const paymentStatusQuery = useQuery({
		queryKey: paymentQueryKeys.detail(payment?.id ?? "pending"),
		queryFn: () => getPaymentIntent(payment?.id ?? ""),
		enabled: Boolean(payment?.id && isPaymentPending(payment.status)),
		refetchInterval: (query) => {
			const status = query.state.data?.payment.status ?? payment?.status;
			if (!status || !isPaymentPending(status)) return false;
			return status === "UNKNOWN" ? 12_000 : 5_000;
		},
		retry: (failureCount, error) =>
			error instanceof ApiRequestError && error.statusCode
				? error.statusCode >= 500 && failureCount < 2
				: failureCount < 2,
	});

	const reconcileMutation = useMutation({
		mutationFn: () => reconcilePaymentIntent(payment?.id ?? ""),
		onSuccess: (response) => applyPayment(response.payment),
		onError: (error) =>
			applyCheckoutError(error, "Payment status could not be refreshed."),
	});

	const canonicalPayment = paymentStatusQuery.data?.payment ?? payment;
	const canonicalDialogMode =
		canonicalPayment && ["processing", "unknown"].includes(dialogMode)
			? modeForPayment(canonicalPayment.status)
			: dialogMode;
	const selectedAvailabilityMessage =
		selectedBlockedRange &&
		canSeeUnavailableMessage &&
		!quote
			? buildAvailabilityMessage(selectedBlockedRange)
			: null;

	useEffect(() => {
		if (canonicalPayment?.status !== "SUCCEEDED") return;
		void queryClient.invalidateQueries({ queryKey: bookingQueryKeys.myLists() });
		void queryClient.invalidateQueries({
			queryKey: bookingQueryKeys.availabilityLists(),
		});
		void queryClient.invalidateQueries({ queryKey: paymentQueryKeys.lists() });
	}, [canonicalPayment?.status, queryClient]);

	function applyPayment(nextPayment: PaymentIntent) {
		setPayment(nextPayment);
		queryClient.setQueryData(paymentQueryKeys.detail(nextPayment.id), {
			message: paymentStatusMessage(nextPayment.status),
			payment: nextPayment,
		});

		if (nextPayment.status === "SUCCEEDED") {
			setDialogMode("success");
			void queryClient.invalidateQueries({ queryKey: bookingQueryKeys.myLists() });
			void queryClient.invalidateQueries({
				queryKey: bookingQueryKeys.availabilityLists(),
			});
			void queryClient.invalidateQueries({ queryKey: paymentQueryKeys.lists() });
			return;
		}
		if (nextPayment.status === "FAILED") {
			setDialogMode("failed");
			return;
		}
		if (nextPayment.status === "EXPIRED" || nextPayment.status === "CANCELLED") {
			setDialogMode("expired");
			return;
		}
		setDialogMode(nextPayment.status === "UNKNOWN" ? "unknown" : "processing");
	}

	function applyCheckoutError(error: unknown, fallback: string) {
		const apiError = error instanceof ApiRequestError ? error : undefined;
		setCheckoutError(apiError?.message ?? fallback);
		setSupportReference(apiError?.requestId);
	}

	function resetCheckoutState() {
		setQuote(undefined);
		setCheckout(undefined);
		setPayment(undefined);
		setPaymentAction(undefined);
		setCheckoutError(undefined);
		setSupportReference(undefined);
		setRateChangedFrom(undefined);
		quoteKeyRef.current = undefined;
		checkoutKeyRef.current = undefined;
		attemptKeyRef.current = undefined;
		paymentIntentIdRef.current = undefined;
		paymentSubmissionRef.current = false;
	}

	function handleDateRangeChange(nextRange: DateRange | undefined) {
		previousRateRef.current = undefined;
		resetCheckoutState();
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

	function rejectUnavailableDateRange(
		message: string | null = unavailableMessage,
	) {
		setAvailabilityMessage(canSeeUnavailableMessage ? message : null);
	}

	function openBookingDialog() {
		if (!fromDate || !toDate) {
			setCheckoutError("Choose your start and end date before booking.");
			setDialogMode("error");
			setIsDialogOpen(true);
			return;
		}
		if (canonicalPayment) {
			setIsDialogOpen(true);
			applyPayment(canonicalPayment);
			return;
		}
		if (quote && new Date(quote.expiresAt).getTime() > Date.now()) {
			setIsDialogOpen(true);
			setDialogMode("quote");
			return;
		}
		if (quote) {
			setIsDialogOpen(true);
			previousRateRef.current = quote.exchangeRateValue ?? undefined;
			resetCheckoutState();
			quoteMutation.mutate();
			return;
		}
		if (doesDateRangeOverlapBlockedRange(dateRange, blockedRanges)) {
			const overlap = findOverlappingBlockedRange(dateRange, blockedRanges);
			setCheckoutError(
				canSeeUnavailableMessage
					? buildAvailabilityMessage(overlap)
					: "Sign in to check listing availability and continue booking.",
			);
			setDialogMode("error");
			setIsDialogOpen(true);
			void queryClient.invalidateQueries({
				queryKey: bookingQueryKeys.availabilityLists(),
			});
			return;
		}

		setIsDialogOpen(true);
		resetCheckoutState();
		quoteMutation.mutate();
	}

	function retryPayment() {
		attemptKeyRef.current = undefined;
		setPaymentAction(undefined);
		setCheckoutError(undefined);
		setDialogMode("quote");
	}

	function submitPayment(input: {
		method: PaymentMethod;
		network?: PaymentNetwork;
		phoneNumber: string;
	}) {
		if (paymentSubmissionRef.current || paymentMutation.isPending) {
			return;
		}

		paymentSubmissionRef.current = true;
		paymentMutation.mutate(input);
	}

	const bookingDialog = (
		<ListingBookingDialog
			open={isDialogOpen}
			mode={canonicalDialogMode}
			listingTitle={listing.title}
			formattedRange={formattedRange}
			durationCount={durationCount}
			durationLabel={durationLabel}
			estimatedTotal={totalPrice}
			quote={quote}
			rateChangedFrom={rateChangedFrom}
			payment={canonicalPayment}
			paymentAction={paymentAction}
			defaultPhone={currentUser?.phone ?? ""}
			errorMessage={checkoutError}
			supportReference={supportReference}
			isCheckingStatus={reconcileMutation.isPending}
			onOpenChange={setIsDialogOpen}
			onPay={submitPayment}
			onCheckStatus={() => reconcileMutation.mutate()}
			onRetryPayment={retryPayment}
			onRefreshQuote={() => {
				previousRateRef.current = quote?.exchangeRateValue ?? undefined;
				resetCheckoutState();
				quoteMutation.mutate();
			}}
			onAcknowledgeRateChange={() => setRateChangedFrom(undefined)}
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
		availabilityMessage: selectedAvailabilityMessage ?? availabilityMessage,
		selectedBlockedRange,
		isAvailabilityLoading: availabilityQuery.isPending,
		isBookingPending: quoteMutation.isPending || paymentMutation.isPending,
		handleDateRangeChange,
		rejectUnavailableDateRange,
		openBookingDialog,
		bookingDialog,
	};
}

function getRequestKey(
	ref: { current?: string },
	prefix: "quote" | "checkout" | "attempt",
): string {
	ref.current ??= createRequestKey(prefix);
	return ref.current;
}

function createRequestKey(prefix: string): string {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return `${prefix}_${crypto.randomUUID()}`;
	}
	return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function isPaymentPending(status: PaymentIntent["status"]): boolean {
	return ["CREATED", "ACTION_REQUIRED", "PROCESSING", "UNKNOWN"].includes(
		status,
	);
}

function isExpiredError(error: unknown): boolean {
	return (
		error instanceof ApiRequestError &&
		["HOLD_EXPIRED", "QUOTE_EXPIRED"].includes(error.code)
	);
}

function paymentStatusMessage(status: PaymentIntent["status"]): string {
	if (status === "SUCCEEDED") return "Payment confirmed. Your booking is ready.";
	if (status === "FAILED") return "Payment was not completed.";
	if (status === "UNKNOWN") return "Payment is still being confirmed.";
	return "Payment is processing.";
}

function modeForPayment(
	status: PaymentIntent["status"],
): ListingBookingDialogMode {
	if (status === "SUCCEEDED") return "success";
	if (["FAILED", "REVERSED"].includes(status)) return "failed";
	if (["PARTIALLY_REFUNDED", "REFUNDED"].includes(status)) return "success";
	if (status === "EXPIRED" || status === "CANCELLED") return "expired";
	if (status === "UNKNOWN") return "unknown";
	return "processing";
}

function buildAvailabilityMessage(
	blockedRange?: ListingAvailabilityBlockedRange,
): string {
	if (!blockedRange?.isOwnBooking) return unavailableMessage;
	return blockedRange.bookingNo
		? `${ownBookingMessage} Booking ${blockedRange.bookingNo} covers the selected dates.`
		: ownBookingMessage;
}
