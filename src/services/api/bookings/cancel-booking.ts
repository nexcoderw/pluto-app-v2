import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { BOOKING_ROUTES } from "./routes";
import type { CancelBookingPayload, CancelBookingResponse } from "./types";

export async function cancelBooking(
	bookingId: string,
	payload?: CancelBookingPayload,
): Promise<CancelBookingResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.patch<CancelBookingResponse>(
				BOOKING_ROUTES.cancel(bookingId),
				payload ?? {},
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
