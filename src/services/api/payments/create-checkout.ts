import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { PAYMENT_ROUTES } from "./routes";
import type { CreateCheckoutPayload, CreateCheckoutResponse } from "./types";

// Accepts one server-issued quote without sending a client-calculated amount.
export async function createCheckout(
	payload: CreateCheckoutPayload,
): Promise<CreateCheckoutResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.post<CreateCheckoutResponse>(
				PAYMENT_ROUTES.checkouts,
				payload,
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
