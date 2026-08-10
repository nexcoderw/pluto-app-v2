import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import Script from 'next/script';
import { AppProviders } from '@/providers/app-providers';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const outfit = Outfit({
	variable: '--font-outfit',
	subsets: ['latin'],
	display: 'swap',
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:4000';

export const metadata: Metadata = {
	metadataBase: new URL(appUrl),
	title: {
		default: 'Pluto Booking',
		template: '%s | Pluto Booking',
	},
	description:
		'Book trusted cars, apartments, hotel rooms, and stays with Pluto Booking.',
	icons: {
		icon: [
			{
				url: '/favicon.png',
				sizes: '259x259',
				type: 'image/png',
			},
			{
				url: '/favicon-w.png',
				sizes: '127x127',
				type: 'image/png',
				media: '(prefers-color-scheme: dark)',
			},
		],
		shortcut: '/favicon.png',
		apple: '/favicon.png',
	},
	openGraph: {
		title: 'Pluto Booking',
		description:
			'Book trusted cars, apartments, hotel rooms, and stays with Pluto Booking.',
		siteName: 'Pluto Booking',
		images: [
			{
				url: '/logo-b.png',
				width: 630,
				height: 185,
				alt: 'Pluto Booking',
			},
		],
	},
};

export default function RootLayout({
  children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${outfit.variable} font-sans antialiased`}>
				<AppProviders>
					{children}
					<Toaster richColors position="top-right" />
				</AppProviders>
				<Script
					src="https://www.googletagmanager.com/gtag/js?id=G-RTJCW9Z5CT"
					strategy="afterInteractive"
				/>
				<Script id="google-analytics" strategy="afterInteractive">
					{`
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());
						gtag('config', 'G-RTJCW9Z5CT');
					`}
				</Script>
			</body>
		</html>
	);
}
