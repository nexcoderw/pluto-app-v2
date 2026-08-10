export type AnalyticsConsentChoice = 'granted' | 'denied';

const ANALYTICS_CONSENT_STORAGE_KEY = 'pluto.analytics-consent.v1';
const ANALYTICS_CONSENT_CHANGE_EVENT = 'pluto:analytics-consent-change';

let volatileConsent: AnalyticsConsentChoice | null = null;

export function getAnalyticsConsent(): AnalyticsConsentChoice | null {
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		const storedConsent = window.localStorage.getItem(
			ANALYTICS_CONSENT_STORAGE_KEY,
		);

		if (storedConsent === 'granted' || storedConsent === 'denied') {
			volatileConsent = storedConsent;
			return storedConsent;
		}
	} catch {
		return volatileConsent;
	}

	return volatileConsent;
}

export function getServerAnalyticsConsent(): null {
	return null;
}

export function saveAnalyticsConsent(
	choice: AnalyticsConsentChoice,
): boolean {
	volatileConsent = choice;

	let persisted = true;

	try {
		window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, choice);
	} catch {
		persisted = false;
	}

	window.dispatchEvent(new Event(ANALYTICS_CONSENT_CHANGE_EVENT));

	return persisted;
}

export function subscribeToAnalyticsConsent(
	listener: () => void,
): () => void {
	if (typeof window === 'undefined') {
		return () => undefined;
	}

	const handleStorage = (event: StorageEvent) => {
		if (
			event.key === ANALYTICS_CONSENT_STORAGE_KEY ||
			event.key === null
		) {
			listener();
		}
	};

	window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, listener);
	window.addEventListener('storage', handleStorage);

	return () => {
		window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, listener);
		window.removeEventListener('storage', handleStorage);
	};
}