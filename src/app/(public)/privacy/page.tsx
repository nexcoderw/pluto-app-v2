import type { Metadata } from "next";
import { LegalUnderConstruction } from "@/components/legal/legal-under-construction";

export const metadata: Metadata = {
	title: "Privacy Policy | Pluto Booking",
	description: "Pluto Booking privacy policy is currently under construction.",
};

export default function PrivacyPage() {
	return <LegalUnderConstruction kind="privacy" />;
}
