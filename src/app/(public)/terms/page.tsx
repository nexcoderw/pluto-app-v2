import type { Metadata } from "next";
import { LegalUnderConstruction } from "@/components/legal/legal-under-construction";

export const metadata: Metadata = {
	title: "Terms of Service | Pluto Booking",
	description: "Pluto Booking terms of service are currently under construction.",
};

export default function TermsPage() {
	return <LegalUnderConstruction kind="terms" />;
}
