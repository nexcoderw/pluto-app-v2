'use client';

import Script from 'next/script';
import {
	BarChart3,
	Settings2,
	ShieldCheck,
} from 'lucide-react';
import {
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	getAnalyticsConsent,
	getServerAnalyticsConsent,
	saveAnalyticsConsent,
	subscribeToAnalyticsConsent,
	type AnalyticsConsentChoice,
} from '@/lib/analytics/consent';
import {
	flushPendingAnalyticsEvents,
	updateLoadedAnalyticsConsent,
} from '@/lib/analytics/analytics';
import styles from './google-analytics-consent.module.css';

type GoogleAnalyticsConsentProps = {
	enabled: boolean;
	measurementId: string;
};

function subscribeToHydration(): () => void {
	return () => undefined;
}

function getHydratedSnapshot(): boolean {
	return true;
}

function getServerHydratedSnapshot(): boolean {
	return false;
}

export function GoogleAnalyticsConsent({
	enabled,
	measurementId,
}: GoogleAnalyticsConsentProps) {
	// State setup
	const consent = useSyncExternalStore(
		subscribeToAnalyticsConsent,
		getAnalyticsConsent,
		getServerAnalyticsConsent,
	);

	const hydrated = useSyncExternalStore(
		subscribeToHydration,
		getHydratedSnapshot,
		getServerHydratedSnapshot,
	);

	const [preferencesOpen, setPreferencesOpen] =
		useState(false);

	const previousConsent =
		useRef<AnalyticsConsentChoice | null>(consent);

	// Derived values
	const analyticsConfigured =
		enabled && measurementId.trim().length > 0;

	const shouldLoadAnalytics =
		analyticsConfigured &&
		consent === 'granted' &&
		hydrated;

	const shouldShowPreferences =
		analyticsConfigured &&
		hydrated &&
		(consent === null || preferencesOpen);

	// Keep privacy state synchronized across browser tabs.
	useEffect(() => {
		const previousValue = previousConsent.current;

		previousConsent.current = consent;

		if (
			previousValue === 'granted' &&
			consent === 'denied'
		) {
			updateLoadedAnalyticsConsent('denied');

			const reloadTimer = window.setTimeout(() => {
				window.location.reload();
			}, 150);

			return () => {
				window.clearTimeout(reloadTimer);
			};
		}

		return undefined;
	}, [consent]);

	// Event handlers
	const handleConsentChoice = (
		choice: AnalyticsConsentChoice,
	) => {
		const persisted = saveAnalyticsConsent(choice);

		setPreferencesOpen(false);

		if (persisted) {
			toast.success(
				choice === 'granted'
					? 'Analytics enabled. Thanks for helping us improve Pluto Booking.'
					: 'Analytics disabled. Only necessary site features will be used.',
			);

			return;
		}

		toast.error(
			'Your privacy choice applies for this visit, but this browser could not remember it.',
		);
	};

	// Render
	if (!analyticsConfigured || !hydrated) {
		return null;
	}

	return (
		<>
			{shouldLoadAnalytics ? (
				<>
					<Script
						id="google-analytics-consent"
						strategy="afterInteractive"
					>
						{`
							window.dataLayer = window.dataLayer || [];

							function gtag() {
								dataLayer.push(arguments);
							}

							window.gtag = gtag;

							gtag('consent', 'default', {
								ad_storage: 'denied',
								ad_user_data: 'denied',
								ad_personalization: 'denied',
								analytics_storage: 'denied'
							});

							gtag('consent', 'update', {
								ad_storage: 'denied',
								ad_user_data: 'denied',
								ad_personalization: 'denied',
								analytics_storage: 'granted'
							});

							gtag('js', new Date());

							gtag('config', ${JSON.stringify(
								measurementId,
							)}, {
								allow_google_signals: false,
								allow_ad_personalization_signals: false
							});
						`}
					</Script>

					<Script
						src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
							measurementId,
						)}`}
						strategy="afterInteractive"
						onReady={() => {
							flushPendingAnalyticsEvents();
						}}
					/>
				</>
			) : null}

			{shouldShowPreferences ? (
				<div
					className={styles.viewport}
					role="presentation"
				>
					<section
						className={styles.panel}
						aria-labelledby="analytics-consent-title"
						aria-describedby="analytics-consent-description"
					>
						<div className={styles.content}>
							<div
								className={styles.icon}
								aria-hidden="true"
							>
								<ShieldCheck />
							</div>

							<div className={styles.copy}>
								<p className={styles.eyebrow}>
									Privacy choices
								</p>

								<h2 id="analytics-consent-title">
									Help us improve Pluto Booking
								</h2>

								<p id="analytics-consent-description">
									We use Google Analytics to understand
									how the marketplace is used and improve
									the booking experience. Advertising
									storage stays off, and necessary site
									features work either way.
								</p>

								{consent !== null ? (
									<p
										className={
											styles.currentChoice
										}
									>
										Current choice:{' '}
										<strong>
											{consent === 'granted'
												? 'Analytics allowed'
												: 'Only necessary'}
										</strong>
									</p>
								) : null}
							</div>
						</div>

						<div className={styles.actions}>
							<Button
								type="button"
								variant="outline"
								className={styles.choiceButton}
								onClick={() =>
									handleConsentChoice(
										'denied',
									)
								}
								aria-label="Use only necessary site features"
							>
								<ShieldCheck
									aria-hidden="true"
								/>
								Only necessary
							</Button>

							<Button
								type="button"
								className={styles.choiceButton}
								onClick={() =>
									handleConsentChoice(
										'granted',
									)
								}
								aria-label="Allow Google Analytics"
							>
								<BarChart3
									aria-hidden="true"
								/>
								Allow analytics
							</Button>
						</div>
					</section>
				</div>
			) : (
				<Button
					type="button"
					variant="outline"
					size="icon"
					className={styles.settingsButton}
					onClick={() => setPreferencesOpen(true)}
					aria-label="Open privacy choices"
					title="Privacy choices"
				>
					<Settings2 aria-hidden="true" />
				</Button>
			)}
		</>
	);
}