import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { FLIGHT_REQUEST_ROUTES } from "./routes";
import type {
  FlightRequestMessagePayload,
  FlightRequestMessageResponse,
} from "./types";

export async function sendFlightRequestMessage(
  requestId: string,
  payload: FlightRequestMessagePayload,
): Promise<FlightRequestMessageResponse> {
  return withFreshUserSession(async () => {
    try {
      const response = await apiClient.post<FlightRequestMessageResponse>(
        FLIGHT_REQUEST_ROUTES.messages(requestId),
        payload,
      );

      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  });
}
