import { API_BASE_URL } from '../client';
import { refreshUserSession } from './refresh-session';
import { USER_AUTH_ROUTES } from './routes';
import type { UserAuthResponse, UserRole } from './types';

export type UserGoogleCallbackStatus =
	| 'success'
	| 'failed'
	| 'phone_required'
	| 'missing';

// Feature flag: keeps Google buttons hidden if OAuth is disabled for this frontend.
export function isUserGoogleLoginEnabled(): boolean {
	return process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN !== 'false';
}

// Request target: Google login starts as a browser redirect, not an XHR request.
export function getUserGoogleLoginUrl(role: UserRole = 'CUSTOMER'): string {
	const url = new URL(
		`${API_BASE_URL.replace(/\/$/, '')}${USER_AUTH_ROUTES.googleLogin}`,
	);

	url.searchParams.set('role', role);
	return url.toString();
}

// Browser action: avoids placing provider tokens in frontend application code.
export function redirectToUserGoogleLogin(role: UserRole = 'CUSTOMER'): void {
	window.location.assign(getUserGoogleLoginUrl(role));
}

// Callback state: backend only redirects with safe status flags.
export function readUserGoogleCallbackStatus(
	searchParams: URLSearchParams,
): UserGoogleCallbackStatus {
	const status = searchParams.get('status');

	if (status === 'success' || status === 'failed' || status === 'phone_required') {
		return status;
	}

	return 'missing';
}

// Endpoint follow-up: exchange secure refresh cookie for an in-memory access token.
export async function completeUserGoogleLogin(): Promise<UserAuthResponse> {
	return refreshUserSession();
}
