import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { USER_AUDIT_LOG_ROUTES } from "./routes";
import type {
	ListUserAuditLogsRequest,
	ListUserAuditLogsResponse,
} from "./types";

export async function listUserAuditLogs(
	params: ListUserAuditLogsRequest = {},
): Promise<ListUserAuditLogsResponse> {
	try {
		const response = await apiClient.get<ListUserAuditLogsResponse>(
			USER_AUDIT_LOG_ROUTES.list,
			{ params },
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
