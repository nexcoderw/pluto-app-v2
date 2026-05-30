import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { clearUserAccessToken } from '../token-store';
import { USER_AUTH_ROUTES } from './routes';
import type { ApiMessageResponse } from './types';

// Request payload: backend clears the refresh cookie.
export type LogoutUserRequest = void;

// Response payload: only user-safe confirmation copy.
export type LogoutUserResponse = ApiMessageResponse;

// Endpoint call: clear local memory even when the server request fails.
export async function logoutUser(): Promise<LogoutUserResponse> {
	try {
		const response = await apiClient.post<LogoutUserResponse>(
			USER_AUTH_ROUTES.logout,
		);

		clearUserAccessToken();
		return response.data;
	} catch (error) {
		clearUserAccessToken();
		throw normalizeApiError(error);
	}
}
