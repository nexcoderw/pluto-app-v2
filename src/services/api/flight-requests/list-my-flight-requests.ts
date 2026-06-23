import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { FLIGHT_REQUEST_ROUTES } from "./routes";
import type {
  ListFlightRequestsRequest,
  ListFlightRequestsResponse,
} from "./types";

export async function listMyFlightRequests(
  params: ListFlightRequestsRequest = {},
): Promise<ListFlightRequestsResponse> {
  return withFreshUserSession(async () => {
    try {
      const response = await apiClient.get<ListFlightRequestsResponse>(
        FLIGHT_REQUEST_ROUTES.myList,
        { params },
      );

      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  });
}
