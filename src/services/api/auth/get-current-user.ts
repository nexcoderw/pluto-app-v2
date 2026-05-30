import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { USER_AUTH_ROUTES } from './routes';
import type { UserCurrentProfileResponse } from './types';

// Request payload: bearer token is attached by the shared API client.
export type GetCurrentUserRequest = void;

// Response payload: safe customer or partner profile.
export type GetCurrentUserResponse = UserCurrentProfileResponse;

// Endpoint call: use in protected customer experiences.
export async function getCurrentUser(): Promise<GetCurrentUserResponse> {
	try {
		const response = await apiClient.get<GetCurrentUserResponse>(
			USER_AUTH_ROUTES.currentUser,
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
