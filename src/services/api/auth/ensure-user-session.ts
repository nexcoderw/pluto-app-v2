import { ApiRequestError } from "../errors";
import {
	clearUserAccessToken,
	getUserAccessToken,
	hasKnownUserSession,
} from "../token-store";
import { refreshUserSession } from "./refresh-session";

// Protected user requests use short-lived access tokens stored in memory.
// This helper silently rotates the token from the secure refresh cookie when
// the UI still has a known session but memory was cleared by a page reload.
export async function ensureUserAccessToken(): Promise<string | null> {
	const accessToken = getUserAccessToken();

	if (accessToken) {
		return accessToken;
	}

	if (!hasKnownUserSession()) {
		return null;
	}

	const session = await refreshUserSession();

	return session.accessToken;
}

// Authenticated mutations can fail with 401 when the access token expired
// between render and submit. Retry once after rotating the token.
export async function withFreshUserSession<T>(
	request: () => Promise<T>,
): Promise<T> {
	await ensureUserAccessToken();

	try {
		return await request();
	} catch (error) {
		if (
			error instanceof ApiRequestError &&
			error.statusCode === 401 &&
			hasKnownUserSession()
		) {
			await refreshUserSession();

			return request();
		}

		throw error;
	}
}

// Public endpoints can return richer data for signed-in users. If the browser
// attaches a stale token, retry anonymously instead of failing the public page.
export async function withOptionalFreshUserSession<T>(
	request: () => Promise<T>,
): Promise<T> {
	if (hasKnownUserSession()) {
		await ensureUserAccessToken().catch(() => undefined);
	}

	try {
		return await request();
	} catch (error) {
		if (error instanceof ApiRequestError && error.statusCode === 401) {
			clearUserAccessToken();

			return request();
		}

		throw error;
	}
}
