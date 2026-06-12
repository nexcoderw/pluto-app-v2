import { withOptionalFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { BOOKING_ROUTES } from "./routes";
import type {
	ListingAvailabilityRequest,
	ListingAvailabilityResponse,
} from "./types";

export async function getListingAvailability(
	productId: string,
	params?: ListingAvailabilityRequest,
): Promise<ListingAvailabilityResponse> {
	return withOptionalFreshUserSession(async () => {
		try {
			const response = await apiClient.get<ListingAvailabilityResponse>(
				BOOKING_ROUTES.availability(productId),
				{ params },
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
