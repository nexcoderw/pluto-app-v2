export type AnalyticsScalar = string | number;

export type AnalyticsItem = Readonly<
	Record<string, AnalyticsScalar | null | undefined>
>;

export type AnalyticsEventValue =
	| AnalyticsScalar
	| readonly AnalyticsItem[];

export type AnalyticsEventParameters = Readonly<
	Record<string, AnalyticsEventValue | null | undefined>
>;

export type NormalizedAnalyticsItem = Record<
	string,
	AnalyticsScalar
>;

export type NormalizedAnalyticsEventValue =
	| AnalyticsScalar
	| NormalizedAnalyticsItem[];

export type NormalizedAnalyticsEventParameters = Record<
	string,
	NormalizedAnalyticsEventValue
>;

export type AnalyticsDispatchStatus =
	| 'sent'
	| 'disabled'
	| 'consent_not_granted'
	| 'tag_unavailable'
	| 'invalid_event_name'
	| 'invalid_parameters';

export type GoogleAnalyticsConsentState =
	| 'granted'
	| 'denied';

export type GoogleAnalyticsConsentSettings = {
	ad_storage: GoogleAnalyticsConsentState;
	ad_user_data: GoogleAnalyticsConsentState;
	ad_personalization: GoogleAnalyticsConsentState;
	analytics_storage: GoogleAnalyticsConsentState;
};

export interface GoogleTagFunction {
	(
		command: 'event',
		eventName: string,
		parameters?: NormalizedAnalyticsEventParameters,
	): void;

	(
		command: 'consent',
		action: 'default' | 'update',
		settings: GoogleAnalyticsConsentSettings,
	): void;
}

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: GoogleTagFunction;
	}
}