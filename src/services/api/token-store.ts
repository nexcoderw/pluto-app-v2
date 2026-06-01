import type { UserAuthProfile } from './auth/types';
import type { PartnerProfileStatus } from './partner-profile/types';

export const USER_SESSION_CHANGED_EVENT = 'pluto:user-session-changed';

const USER_SESSION_FLAG_KEY = 'pluto:user-session-active';
const USER_SESSION_PROFILE_KEY = 'pluto:user-session-profile';
const USER_SESSION_PARTNER_STATUS_KEY = 'pluto:user-session-partner-status';

let userAccessToken: string | null = null;

export function setUserAccessToken(token: string): void {
	userAccessToken = token;
}

export function getUserAccessToken(): string | null {
	return userAccessToken;
}

export function clearUserAccessToken(): void {
	userAccessToken = null;
}

export function storeUserSession(
	user: UserAuthProfile,
	partnerProfileStatus?: PartnerProfileStatus | null,
): void {
	if (!isBrowser()) {
		return;
	}

	window.localStorage.setItem(USER_SESSION_FLAG_KEY, 'true');
	window.localStorage.setItem(USER_SESSION_PROFILE_KEY, JSON.stringify(user));
	setCachedPartnerProfileStatus(
		user.role === 'PARTNER' ? (partnerProfileStatus ?? null) : null,
	);
	notifyUserSessionChanged(user);
}

export function clearUserSession(): void {
	userAccessToken = null;

	if (!isBrowser()) {
		return;
	}

	window.localStorage.removeItem(USER_SESSION_FLAG_KEY);
	window.localStorage.removeItem(USER_SESSION_PROFILE_KEY);
	window.localStorage.removeItem(USER_SESSION_PARTNER_STATUS_KEY);
	notifyUserSessionChanged(null);
}

export function hasKnownUserSession(): boolean {
	if (userAccessToken) {
		return true;
	}

	if (!isBrowser()) {
		return false;
	}

	return window.localStorage.getItem(USER_SESSION_FLAG_KEY) === 'true';
}

export function getCachedUserProfile(): UserAuthProfile | null {
	if (!isBrowser()) {
		return null;
	}

	const cachedProfile = window.localStorage.getItem(USER_SESSION_PROFILE_KEY);

	if (!cachedProfile) {
		return null;
	}

	try {
		return JSON.parse(cachedProfile) as UserAuthProfile;
	} catch {
		window.localStorage.removeItem(USER_SESSION_PROFILE_KEY);
		return null;
	}
}

export function setCachedPartnerProfileStatus(
	status: PartnerProfileStatus | null,
): void {
	if (!isBrowser()) {
		return;
	}

	if (!status) {
		window.localStorage.removeItem(USER_SESSION_PARTNER_STATUS_KEY);
		notifyUserSessionChanged(getCachedUserProfile());
		return;
	}

	window.localStorage.setItem(USER_SESSION_PARTNER_STATUS_KEY, status);
	notifyUserSessionChanged(getCachedUserProfile());
}

export function getCachedPartnerProfileStatus(): PartnerProfileStatus | null {
	if (!isBrowser()) {
		return null;
	}

	const status = window.localStorage.getItem(USER_SESSION_PARTNER_STATUS_KEY);

	if (
		status === 'DRAFT' ||
		status === 'PENDING' ||
		status === 'APPROVED' ||
		status === 'REJECTED'
	) {
		return status;
	}

	return null;
}

export function subscribeToUserSession(
	listener: (user: UserAuthProfile | null) => void,
): () => void {
	if (!isBrowser()) {
		return () => undefined;
	}

	function handleSessionChange(event: Event) {
		const detail = (event as CustomEvent<UserAuthProfile | null>).detail;
		listener(detail ?? getCachedUserProfile());
	}

	window.addEventListener(USER_SESSION_CHANGED_EVENT, handleSessionChange);
	window.addEventListener('storage', handleSessionChange);

	return () => {
		window.removeEventListener(USER_SESSION_CHANGED_EVENT, handleSessionChange);
		window.removeEventListener('storage', handleSessionChange);
	};
}

function notifyUserSessionChanged(user: UserAuthProfile | null): void {
	if (!isBrowser()) {
		return;
	}

	window.dispatchEvent(
		new CustomEvent(USER_SESSION_CHANGED_EVENT, {
			detail: user,
		}),
	);
}

function isBrowser(): boolean {
	return typeof window !== 'undefined';
}
