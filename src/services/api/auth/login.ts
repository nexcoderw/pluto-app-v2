import { apiClient } from '../client';
import { ApiRequestError, normalizeApiError } from '../errors';
import { setUserAccessToken } from '../token-store';
import { logoutUser } from './logout';
import {
	createPublicUserRoleError,
	isPublicUserRole,
} from './public-user-role';
import { USER_AUTH_ROUTES } from './routes';
import { storeAuthenticatedUserSession } from './session-bootstrap';
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

		if (!isPublicUserRole(response.data.user.role)) {
			setUserAccessToken(response.data.accessToken);
			await logoutUser().catch(() => undefined);
			throw createPublicUserRoleError();
		}

		setUserAccessToken(response.data.accessToken);
		await storeAuthenticatedUserSession(response.data.user);
		return response.data;
	} catch (error) {
		if (error instanceof ApiRequestError) {
			throw error;
		}

		throw normalizeApiError(error);
	}
}
