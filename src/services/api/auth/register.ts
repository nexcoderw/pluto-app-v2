import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { setUserAccessToken } from '../token-store';
import { USER_AUTH_ROUTES } from './routes';
import { storeAuthenticatedUserSession } from './session-bootstrap';
import type { PartnerType, UserAuthResponse, UserRole } from './types';

// Request payload: the backend requires every registration field.
export type RegisterUserRequest = {
	fullName: string;
	email: string;
	phone: string;
	password: string;
	role: UserRole;
	partnerType?: PartnerType;
	deviceName?: string;
};

// Response payload: safe user profile plus a short-lived access token.
export type RegisterUserResponse = UserAuthResponse;

// Endpoint call: creates a customer or partner account and starts a session.
export async function registerUser(
	payload: RegisterUserRequest,
): Promise<RegisterUserResponse> {
	try {
		const response = await apiClient.post<RegisterUserResponse>(
			USER_AUTH_ROUTES.register,
			payload,
		);

		setUserAccessToken(response.data.accessToken);
		await storeAuthenticatedUserSession(response.data.user);
		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
