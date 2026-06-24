import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { REFERENCE_AIRPORT_ROUTES } from "./routes";
import type { SearchAirportsRequest, SearchAirportsResponse } from "./types";

// Request payload: public airport autocomplete query with a small capped limit.
// Response payload: compact backend-controlled airport suggestions.
// Error handling: normalize transport and API failures for form-level messaging.
export async function searchAirports(
  params: SearchAirportsRequest = {},
): Promise<SearchAirportsResponse> {
  try {
    const response = await apiClient.get<SearchAirportsResponse>(
      REFERENCE_AIRPORT_ROUTES.search,
      { params },
    );

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
