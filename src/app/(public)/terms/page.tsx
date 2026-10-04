import { LegalUnderConstruction } from "@/components/legal/legal-under-construction";
import { createPublicMetadata } from "@/lib/seo";

export const metadata = createPublicMetadata({
	title: "Terms of Service",
	description: "Pluto Booking terms of service are currently under construction.",
	path: "/terms",
	index: false,
});

export default function TermsPage() {
	return <LegalUnderConstruction kind="terms" />;
}
