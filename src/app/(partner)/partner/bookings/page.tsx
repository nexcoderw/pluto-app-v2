import type { Metadata } from "next";
import { PartnerBookingsPage as PartnerBookingsExperience } from "@/components/partner/bookings/partner-bookings-page";

export const metadata: Metadata = {
	title: "Partner Bookings",
	description:
		"Review Pluto Booking partner reservations, customer requests, and booking follow-up activity.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function PartnerBookingsPage() {
	return <PartnerBookingsExperience />;
}
