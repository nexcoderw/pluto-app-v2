import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { PAYMENT_ROUTES } from "./routes";
import type { PaymentIntentResponse } from "./types";

// Retrieves canonical state; browser redirects and local state never prove payment.
export async function getPaymentIntent(
	paymentIntentId: string,
): Promise<PaymentIntentResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.get<PaymentIntentResponse>(
				PAYMENT_ROUTES.intent(paymentIntentId),
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
