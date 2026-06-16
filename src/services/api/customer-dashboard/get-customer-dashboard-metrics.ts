import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { CUSTOMER_DASHBOARD_ROUTES } from "./routes";
import type {
  CustomerDashboardMetricsResponse,
  CustomerDashboardRequest,
} from "./types";

export async function getCustomerDashboardMetrics(
  params: CustomerDashboardRequest = {},
): Promise<CustomerDashboardMetricsResponse> {
  return withFreshUserSession(async () => {
    try {
      const response = await apiClient.get<CustomerDashboardMetricsResponse>(
        CUSTOMER_DASHBOARD_ROUTES.metrics,
        { params },
      );

      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  });
}
