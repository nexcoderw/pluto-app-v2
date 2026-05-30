import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { USER_AUTH_ROUTES } from './routes';
import type { ApiMessageResponse } from './types';

// Request payload: reset tokens come from email links and are never stored locally.
export type ResetUserPasswordRequest = {
	token: string;
	password: string;
};

// Response payload: confirms completion without exposing backend internals.
export type ResetUserPasswordResponse = ApiMessageResponse;

// Endpoint call: completes the password reset.
export async function resetUserPassword(
	payload: ResetUserPasswordRequest,
): Promise<ResetUserPasswordResponse> {
	try {
		const response = await apiClient.post<ResetUserPasswordResponse>(
			USER_AUTH_ROUTES.resetPassword,
			payload,
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
