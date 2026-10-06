import { TermsContent } from "@/components/legal/terms-content";
import { createPublicMetadata } from "@/lib/seo";

export const metadata = createPublicMetadata({
	title: "Terms and Conditions",
	description:
		"Read Pluto Booking's terms for customers making reservations and partners listing accommodations or rental vehicles.",
	path: "/terms",
	keywords: [
		"Pluto Booking terms",
		"booking conditions Rwanda",
		"partner listing agreement",
	],
});

export default function TermsPage() {
	return <TermsContent />;
}
