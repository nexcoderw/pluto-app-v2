import type { Metadata } from "next";
import { CustomerBookingsPage as CustomerBookingsExperience } from "@/components/account/bookings/customer-bookings-page";

export const metadata: Metadata = {
	title: "Bookings | Pluto Booking",
	description: "View your Pluto Booking customer reservations.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function CustomerBookingsPage() {
	return <CustomerBookingsExperience />;
}
