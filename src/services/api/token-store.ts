import type { UserAuthProfile } from './auth/types';

export const USER_SESSION_CHANGED_EVENT = 'pluto:user-session-changed';

const USER_SESSION_FLAG_KEY = 'pluto:user-session-active';
const USER_SESSION_PROFILE_KEY = 'pluto:user-session-profile';

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

export function storeUserSession(user: UserAuthProfile): void {
	if (!isBrowser()) {
		return;
	}

	window.localStorage.setItem(USER_SESSION_FLAG_KEY, 'true');
	window.localStorage.setItem(USER_SESSION_PROFILE_KEY, JSON.stringify(user));
	notifyUserSessionChanged(user);
}

export function clearUserSession(): void {
	userAccessToken = null;

	if (!isBrowser()) {
		return;
	}

	window.localStorage.removeItem(USER_SESSION_FLAG_KEY);
	window.localStorage.removeItem(USER_SESSION_PROFILE_KEY);
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
