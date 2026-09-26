import type { Metadata } from "next";
import { ContactPage } from "@/components/contact/contact-page";

const description =
	"Get in touch with Pluto Booking for help with your booking, planning your next trip, or becoming a listing partner.";

export const metadata: Metadata = {
	title: "Contact us",
	description,
	alternates: { canonical: "/contact" },
	openGraph: {
		title: "Contact us | Pluto Booking",
		description,
		url: "/contact",
	},
	robots: { index: true, follow: true },
};

export default function ContactRoute() {
	return <ContactPage />;
}
