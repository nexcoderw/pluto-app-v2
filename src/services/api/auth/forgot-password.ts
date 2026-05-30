import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { USER_AUTH_ROUTES } from './routes';
import type { ApiMessageResponse } from './types';

// Request payload: backend returns the same message whether the email exists or not.
export type ForgotUserPasswordRequest = {
	email: string;
};

// Response payload: safe copy only, with no account-discovery detail.
export type ForgotUserPasswordResponse = ApiMessageResponse;

// Endpoint call: starts the user password reset email flow.
export async function forgotUserPassword(
	payload: ForgotUserPasswordRequest,
): Promise<ForgotUserPasswordResponse> {
	try {
		const response = await apiClient.post<ForgotUserPasswordResponse>(
			USER_AUTH_ROUTES.forgotPassword,
			payload,
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
