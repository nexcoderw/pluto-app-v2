import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { GoogleAnalyticsConsent } from '@/components/shared/google-analytics-consent';
import { Toaster } from '@/components/ui/sonner';
import { AppProviders } from '@/providers/app-providers';
import {
	DEFAULT_DESCRIPTION,
	plutoIcons,
	SITE_NAME,
	siteUrl,
} from '@/lib/seo';
import './globals.css';

const outfit = Outfit({
	variable: '--font-outfit',
	subsets: ['latin'],
	display: 'swap',
});

const googleAnalyticsMeasurementId =
	process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? '';

const googleAnalyticsEnabled =
	process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' &&
	/^G-[A-Z0-9]+$/i.test(googleAnalyticsMeasurementId);

export const metadata: Metadata = {
	metadataBase: siteUrl,
	applicationName: SITE_NAME,
	title: {
		default: SITE_NAME,
		template: `%s | ${SITE_NAME}`,
	},
	description: DEFAULT_DESCRIPTION,
	keywords: [
		'Pluto Booking',
		'Rwanda travel',
		'car rentals',
		'apartments',
		'hotel rooms',
		'holiday stays',
	],
	icons: plutoIcons,
	manifest: '/manifest.webmanifest',
	referrer: 'origin-when-cross-origin',
	formatDetection: { email: false, address: false, telephone: false },
	creator: SITE_NAME,
	publisher: SITE_NAME,
	category: 'travel',
	openGraph: {
		type: 'website',
		locale: 'en_RW',
		url: '/',
		title: SITE_NAME,
		description: DEFAULT_DESCRIPTION,
		siteName: SITE_NAME,
		images: [
			{
				url: '/logo-b.png',
				width: 630,
				height: 185,
				alt: SITE_NAME,
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: SITE_NAME,
		description: DEFAULT_DESCRIPTION,
		images: ['/logo-b.png'],
	},
};

const organizationJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'TravelAgency',
	name: SITE_NAME,
	url: siteUrl.toString(),
	logo: new URL('/logo-b.png', siteUrl).toString(),
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
				/>
			</head>
			<body
				className={`${outfit.variable} font-sans antialiased`}
			>
				<AppProviders>
					{children}
					<Toaster richColors position="top-right" />
				</AppProviders>

				<GoogleAnalyticsConsent
					enabled={googleAnalyticsEnabled}
					measurementId={googleAnalyticsMeasurementId}
				/>
			</body>
		</html>
	);
}
