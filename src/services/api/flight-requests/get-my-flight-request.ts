import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { FLIGHT_REQUEST_ROUTES } from "./routes";
import type { FlightRequestDetail } from "./types";

export async function getMyFlightRequest(
  requestId: string,
): Promise<FlightRequestDetail> {
  return withFreshUserSession(async () => {
    try {
      const response = await apiClient.get<FlightRequestDetail>(
        FLIGHT_REQUEST_ROUTES.myDetail(requestId),
      );

      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  });
}
