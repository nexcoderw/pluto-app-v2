import { ContactPage } from "@/components/contact/contact-page";
import { createPublicMetadata } from "@/lib/seo";

const description =
	"Get in touch with Pluto Booking for help with your booking, planning your next trip, or becoming a listing partner.";

export const metadata = createPublicMetadata({
	title: "Contact us",
	description,
	path: "/contact",
	keywords: ["Pluto Booking support", "travel booking help"],
});

export default function ContactRoute() {
	return <ContactPage />;
}
