import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { FLIGHT_REQUEST_ROUTES } from "./routes";
import type { FlightRequestDetail, SaveFlightRequestPayload } from "./types";

export async function createFlightRequestDraft(
  payload: SaveFlightRequestPayload,
): Promise<FlightRequestDetail> {
  return withFreshUserSession(async () => {
    try {
      const response = await apiClient.post<FlightRequestDetail>(
        FLIGHT_REQUEST_ROUTES.createDraft,
        payload,
      );

      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  });
}
