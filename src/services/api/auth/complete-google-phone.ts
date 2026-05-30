import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { USER_AUTH_ROUTES } from './routes';
import type { UserAuthProfile } from './types';

// Request payload: Google registration must provide a phone number when missing.
export type CompleteGooglePhoneRequest = {
	phone: string;
};

// Response payload: updated safe profile after phone completion.
export type CompleteGooglePhoneResponse = {
	message: string;
	user: UserAuthProfile;
};

// Endpoint call: requires a valid user access token from refresh or login.
export async function completeGooglePhone(
	payload: CompleteGooglePhoneRequest,
): Promise<CompleteGooglePhoneResponse> {
	try {
		const response = await apiClient.post<CompleteGooglePhoneResponse>(
			USER_AUTH_ROUTES.completeGooglePhone,
			payload,
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
