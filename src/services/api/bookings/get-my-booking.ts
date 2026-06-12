import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { BOOKING_ROUTES } from "./routes";
import type { BookingDetailResponse } from "./types";

export async function getMyBooking(
	bookingId: string,
): Promise<BookingDetailResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.get<BookingDetailResponse>(
				BOOKING_ROUTES.myDetail(bookingId),
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
