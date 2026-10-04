import { LegalUnderConstruction } from "@/components/legal/legal-under-construction";
import { createPublicMetadata } from "@/lib/seo";

export const metadata = createPublicMetadata({
	title: "Privacy Policy",
	description: "Pluto Booking privacy policy is currently under construction.",
	path: "/privacy",
	index: false,
});

export default function PrivacyPage() {
	return <LegalUnderConstruction kind="privacy" />;
}
