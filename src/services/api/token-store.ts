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
