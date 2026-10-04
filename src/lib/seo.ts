import type { Metadata } from "next";

export const SITE_NAME = "Pluto Booking";
export const DEFAULT_DESCRIPTION =
	"Book trusted cars, apartments, hotel rooms, and stays with verified Pluto Booking partners.";

export const siteUrl = new URL(
	process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000",
);

export const plutoIcons: Metadata["icons"] = {
	icon: [
		{ url: "/favicon.png", sizes: "259x259", type: "image/png" },
		{
			url: "/favicon-w.png",
			sizes: "127x127",
			type: "image/png",
			media: "(prefers-color-scheme: dark)",
		},
	],
	shortcut: "/favicon.png",
	apple: [{ url: "/favicon.png", sizes: "259x259", type: "image/png" }],
};

type PublicMetadataInput = {
	title: string;
	description: string;
	path: string;
	keywords?: string[];
	absoluteTitle?: boolean;
	index?: boolean;
};

export function createPublicMetadata({
	title,
	description,
	path,
	keywords = [],
	absoluteTitle = false,
	index = true,
}: PublicMetadataInput): Metadata {
	const socialTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;

	return {
		title: absoluteTitle ? { absolute: title } : title,
		description,
		keywords,
		icons: plutoIcons,
		alternates: { canonical: path },
		openGraph: {
			type: "website",
			locale: "en_RW",
			url: path,
			title: socialTitle,
			description,
			siteName: SITE_NAME,
			images: [
				{
					url: "/logo-b.png",
					width: 630,
					height: 185,
					alt: SITE_NAME,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: socialTitle,
			description,
			images: ["/logo-b.png"],
		},
		robots: {
			index,
			follow: index,
			googleBot: { index, follow: index },
		},
	};
}
