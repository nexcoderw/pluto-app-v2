import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { BOOKING_ROUTES } from "./routes";
import type { ListBookingsRequest, ListBookingsResponse } from "./types";

export async function listPartnerBookings(
	params: ListBookingsRequest = {},
): Promise<ListBookingsResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.get<ListBookingsResponse>(
				BOOKING_ROUTES.partnerList,
				{ params },
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
