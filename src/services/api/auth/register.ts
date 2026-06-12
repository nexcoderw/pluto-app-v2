import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { USER_AUTH_ROUTES } from './routes';
import type {
	PartnerType,
	PublicUserRole,
	UserRegistrationResponse,
} from './types';

// Request payload: the backend requires every registration field.
export type RegisterUserRequest = {
	fullName: string;
	email: string;
	phone: string;
	password: string;
	role: PublicUserRole;
	partnerType?: PartnerType;
	deviceName?: string;
};

// Response payload: account creation remains pending until email confirmation.
export type RegisterUserResponse = UserRegistrationResponse;

// Endpoint call: starts registration and sends a one-time verification link.
export async function registerUser(
	payload: RegisterUserRequest,
): Promise<RegisterUserResponse> {
	try {
		const response = await apiClient.post<RegisterUserResponse>(
			USER_AUTH_ROUTES.register,
			payload,
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
