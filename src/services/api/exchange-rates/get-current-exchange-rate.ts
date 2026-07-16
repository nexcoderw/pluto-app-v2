import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { EXCHANGE_RATE_ROUTES } from "./routes";
import type { CurrentExchangeRateResponse } from "./types";

export const currentExchangeRateQueryKey = ["exchange-rates", "USD", "RWF"] as const;

export async function getCurrentExchangeRate(): Promise<CurrentExchangeRateResponse> {
	try {
		const response = await apiClient.get<CurrentExchangeRateResponse>(
			EXCHANGE_RATE_ROUTES.current,
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
