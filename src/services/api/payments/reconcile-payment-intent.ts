import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { PAYMENT_ROUTES } from "./routes";
import type { PaymentIntentResponse } from "./types";

// Requests an authenticated provider status check; it never starts a charge.
export async function reconcilePaymentIntent(
	paymentIntentId: string,
): Promise<PaymentIntentResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.post<PaymentIntentResponse>(
				PAYMENT_ROUTES.reconcile(paymentIntentId),
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
