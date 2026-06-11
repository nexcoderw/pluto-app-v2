import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { BOOKING_ROUTES } from "./routes";
import type {
	UpdatePartnerBookingStatusPayload,
	UpdatePartnerBookingStatusResponse,
} from "./types";

export async function updatePartnerBookingStatus(input: {
	bookingId: string;
	payload: UpdatePartnerBookingStatusPayload;
}): Promise<UpdatePartnerBookingStatusResponse> {
	return withFreshUserSession(async () => {
		try {
			const response =
				await apiClient.patch<UpdatePartnerBookingStatusResponse>(
					BOOKING_ROUTES.partnerStatus(input.bookingId),
					input.payload,
				);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
