import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { setUserAccessToken, storeUserSession } from '../token-store';
import { USER_AUTH_ROUTES } from './routes';
import type { UserAuthResponse } from './types';

// Request payload: customers and partners share this public sign-in route.
export type UserLoginRequest = {
	email: string;
	password: string;
	deviceName?: string;
};

// Response payload: access token is in memory; refresh token stays in the HTTP-only cookie.
export type UserLoginResponse = UserAuthResponse;

// Endpoint call: stores the short-lived access token after successful sign-in.
export async function loginUser(
	payload: UserLoginRequest,
): Promise<UserLoginResponse> {
	try {
		const response = await apiClient.post<UserLoginResponse>(
			USER_AUTH_ROUTES.login,
			payload,
		);

		setUserAccessToken(response.data.accessToken);
		storeUserSession(response.data.user);
		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
