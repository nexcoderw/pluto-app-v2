import { ApiRequestError } from "../errors";

export const BOOKING_QUERY_STALE_TIME_MS = 45_000;
export const BOOKING_AVAILABILITY_STALE_TIME_MS = 30_000;
export const BOOKING_QUERY_GC_TIME_MS = 5 * 60_000;

const NON_RETRYABLE_STATUS_CODES = new Set([400, 401, 403, 404, 409, 422, 429]);

// Booking endpoints should recover from temporary network failures without
// repeating business-rule errors such as unavailable dates or forbidden access.
export function shouldRetryBookingQuery(
	failureCount: number,
	error: unknown,
): boolean {
	if (isApiRequestError(error) && error.statusCode) {
		return (
			!NON_RETRYABLE_STATUS_CODES.has(error.statusCode) && failureCount < 2
		);
	}

	if (isApiRequestError(error) && error.isNetworkError) {
		return failureCount < 2;
	}

	return failureCount < 1;
}

function isApiRequestError(error: unknown): error is ApiRequestError {
	return error instanceof ApiRequestError;
}
