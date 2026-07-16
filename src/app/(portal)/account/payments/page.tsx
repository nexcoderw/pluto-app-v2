import type { Metadata } from "next";
import { CustomerPaymentsPage as CustomerPaymentsExperience } from "@/components/account/payments/customer-payments-page";

export const metadata: Metadata = {
	title: "Payments | Pluto Booking",
	description:
		"Review canonical Pluto Booking payment status, mobile-money progress, and confirmed booking payments.",
	openGraph: {
		title: "Payments | Pluto Booking",
		description:
			"Review canonical Pluto Booking payment status and confirmed booking payments.",
	},
	robots: {
		index: false,
		follow: false,
	},
};

export default function CustomerPaymentsPage() {
	return <CustomerPaymentsExperience />;
}
