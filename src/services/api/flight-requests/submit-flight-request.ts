import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { FLIGHT_REQUEST_ROUTES } from "./routes";
import type { SubmitFlightRequestResponse } from "./types";

export async function submitFlightRequest(
  requestId: string,
): Promise<SubmitFlightRequestResponse> {
  return withFreshUserSession(async () => {
    try {
      const response = await apiClient.post<SubmitFlightRequestResponse>(
        FLIGHT_REQUEST_ROUTES.submit(requestId),
      );

      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  });
}
