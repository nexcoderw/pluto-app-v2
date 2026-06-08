import { apiClient } from '../client';
import { ApiRequestError, normalizeApiError } from '../errors';
import { clearUserSession, setUserAccessToken } from '../token-store';
import {
	createPublicUserRoleError,
	isPublicUserRole,
} from './public-user-role';
import { USER_AUTH_ROUTES } from './routes';
import { storeAuthenticatedUserSession } from './session-bootstrap';
import type { UserAuthResponse } from './types';

// Request payload: backend reads the refresh token from its secure cookie.
export type RefreshUserSessionRequest = void;

// Response payload: rotated access token and safe profile.
export type RefreshUserSessionResponse = UserAuthResponse;

let refreshSessionPromise: Promise<RefreshUserSessionResponse> | null = null;

// Endpoint call: use after reloads and Google callbacks.
export async function refreshUserSession(): Promise<RefreshUserSessionResponse> {
	if (refreshSessionPromise) {
		return refreshSessionPromise;
	}

	refreshSessionPromise = performRefreshUserSession().finally(() => {
		refreshSessionPromise = null;
	});

	return refreshSessionPromise;
}

async function performRefreshUserSession(): Promise<RefreshUserSessionResponse> {
	try {
		const response = await apiClient.post<RefreshUserSessionResponse>(
			USER_AUTH_ROUTES.refreshSession,
		);

		setUserAccessToken(response.data.accessToken);
		if (!isPublicUserRole(response.data.user.role)) {
			clearUserSession();
			throw createPublicUserRoleError();
		}

		await storeAuthenticatedUserSession(response.data.user);
		return response.data;
	} catch (error) {
		if (error instanceof ApiRequestError) {
			throw error;
		}

		const apiError = normalizeApiError(error);

		if (apiError.statusCode === 401) {
			clearUserSession();
		}

		throw apiError;
	}
}
