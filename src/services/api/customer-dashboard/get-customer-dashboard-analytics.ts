import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { CUSTOMER_DASHBOARD_ROUTES } from "./routes";
import type {
  CustomerDashboardAnalyticsResponse,
  CustomerDashboardRequest,
} from "./types";

export async function getCustomerDashboardAnalytics(
  params: CustomerDashboardRequest = {},
): Promise<CustomerDashboardAnalyticsResponse> {
  return withFreshUserSession(async () => {
    try {
      const response = await apiClient.get<CustomerDashboardAnalyticsResponse>(
        CUSTOMER_DASHBOARD_ROUTES.analytics,
        { params },
      );

      return response.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  });
}
