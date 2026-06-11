import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { BOOKING_ROUTES } from "./routes";
import type { CreateBookingPayload, CreateBookingResponse } from "./types";

export async function createBooking(
	payload: CreateBookingPayload,
): Promise<CreateBookingResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.post<CreateBookingResponse>(
				BOOKING_ROUTES.create,
				payload,
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
