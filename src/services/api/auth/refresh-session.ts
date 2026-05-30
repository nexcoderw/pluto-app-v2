import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { setUserAccessToken } from '../token-store';
import { USER_AUTH_ROUTES } from './routes';
import type { UserAuthResponse } from './types';

// Request payload: backend reads the refresh token from its secure cookie.
export type RefreshUserSessionRequest = void;

// Response payload: rotated access token and safe profile.
export type RefreshUserSessionResponse = UserAuthResponse;

// Endpoint call: use after reloads and Google callbacks.
export async function refreshUserSession(): Promise<RefreshUserSessionResponse> {
	try {
		const response = await apiClient.post<RefreshUserSessionResponse>(
			USER_AUTH_ROUTES.refreshSession,
		);

		setUserAccessToken(response.data.accessToken);
		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
