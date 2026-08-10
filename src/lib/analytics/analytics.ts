import {
	getAnalyticsConsent,
	type AnalyticsConsentChoice,
} from './consent';
import type {
	AnalyticsDispatchStatus,
	AnalyticsEventParameters,
	AnalyticsEventValue,
	AnalyticsItem,
	AnalyticsScalar,
	GoogleAnalyticsConsentSettings,
	NormalizedAnalyticsEventParameters,
	NormalizedAnalyticsEventValue,
	NormalizedAnalyticsItem,
} from './types';

const ANALYTICS_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,39}$/;

const MAX_EVENT_PARAMETERS = 25;
const MAX_PARAMETER_STRING_LENGTH = 100;
const MAX_ECOMMERCE_ITEMS = 200;

const analyticsMeasurementId =
	process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? '';

const analyticsEnabled =
	process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' &&
	/^G-[A-Z0-9]+$/i.test(analyticsMeasurementId);

const sensitiveParameterNames = new Set([
	'access_token',
	'address',
	'authorization',
	'card_number',
	'cvc',
	'cvv',
	'email',
	'email_address',
	'first_name',
	'full_name',
	'last_name',
	'name',
	'oauth_code',
	'password',
	'phone',
	'phone_number',
	'refresh_token',
	'reset_token',
	'street_address',
	'token',
	'verification_token',
]);

function isValidAnalyticsName(name: string): boolean {
	return ANALYTICS_NAME_PATTERN.test(name);
}

function isSensitiveParameterName(name: string): boolean {
	return sensitiveParameterNames.has(name.toLowerCase());
}

function normalizeScalar(
	value: AnalyticsScalar,
): AnalyticsScalar | null {
	if (typeof value === 'string') {
		if (value.length > MAX_PARAMETER_STRING_LENGTH) {
			return null;
		}

		return value;
	}

	if (!Number.isFinite(value)) {
		return null;
	}

	return value;
}

function normalizeAnalyticsItem(
	item: AnalyticsItem,
): NormalizedAnalyticsItem | null {
	const normalizedItem: NormalizedAnalyticsItem = {};

	for (const [name, value] of Object.entries(item)) {
		if (value === null || value === undefined) {
			continue;
		}

		if (
			!isValidAnalyticsName(name) ||
			isSensitiveParameterName(name)
		) {
			return null;
		}

		const normalizedValue = normalizeScalar(value);

		if (normalizedValue === null) {
			return null;
		}

		normalizedItem[name] = normalizedValue;
	}

	return normalizedItem;
}

function normalizeEventValue(
	name: string,
	value: AnalyticsEventValue,
): NormalizedAnalyticsEventValue | null {
	if (!Array.isArray(value)) {
		return normalizeScalar(value as AnalyticsScalar);
	}

	if (name !== 'items' || value.length > MAX_ECOMMERCE_ITEMS) {
		return null;
	}

	const normalizedItems: NormalizedAnalyticsItem[] = [];

	for (const item of value) {
		const normalizedItem = normalizeAnalyticsItem(item);

		if (normalizedItem === null) {
			return null;
		}

		normalizedItems.push(normalizedItem);
	}

	return normalizedItems;
}

function normalizeEventParameters(
	parameters: AnalyticsEventParameters,
): NormalizedAnalyticsEventParameters | null {
	const entries = Object.entries(parameters).filter(
		([, value]) => value !== null && value !== undefined,
	);

	if (entries.length > MAX_EVENT_PARAMETERS) {
		return null;
	}

	const normalizedParameters: NormalizedAnalyticsEventParameters =
		{};

	for (const [name, value] of entries) {
		if (
			!isValidAnalyticsName(name) ||
			isSensitiveParameterName(name)
		) {
			return null;
		}

		const normalizedValue = normalizeEventValue(
			name,
			value as AnalyticsEventValue,
		);

		if (normalizedValue === null) {
			return null;
		}

		normalizedParameters[name] = normalizedValue;
	}

	return normalizedParameters;
}

function createConsentSettings(
	choice: AnalyticsConsentChoice,
): GoogleAnalyticsConsentSettings {
	return {
		ad_storage: 'denied',
		ad_user_data: 'denied',
		ad_personalization: 'denied',
		analytics_storage: choice,
	};
}

export function isAnalyticsTrackingAvailable(): boolean {
	if (!analyticsEnabled || typeof window === 'undefined') {
		return false;
	}

	if (getAnalyticsConsent() !== 'granted') {
		return false;
	}

	return typeof window.gtag === 'function';
}

export function updateLoadedAnalyticsConsent(
	choice: AnalyticsConsentChoice,
): boolean {
	if (
		typeof window === 'undefined' ||
		typeof window.gtag !== 'function'
	) {
		return false;
	}

	window.gtag(
		'consent',
		'update',
		createConsentSettings(choice),
	);

	return true;
}

export function trackAnalyticsEvent(
	eventName: string,
	parameters: AnalyticsEventParameters = {},
): AnalyticsDispatchStatus {
	if (!analyticsEnabled) {
		return 'disabled';
	}

	if (typeof window === 'undefined') {
		return 'tag_unavailable';
	}

	if (getAnalyticsConsent() !== 'granted') {
		return 'consent_not_granted';
	}

	if (!isValidAnalyticsName(eventName)) {
		return 'invalid_event_name';
	}

	const normalizedParameters =
		normalizeEventParameters(parameters);

	if (normalizedParameters === null) {
		return 'invalid_parameters';
	}

	if (typeof window.gtag !== 'function') {
		return 'tag_unavailable';
	}

	window.gtag(
		'event',
		eventName,
		normalizedParameters,
	);

	return 'sent';
}