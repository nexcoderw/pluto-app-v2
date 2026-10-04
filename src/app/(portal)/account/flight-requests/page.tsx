import type { Metadata } from "next";
import { CustomerFlightRequestsPage as CustomerFlightRequestsExperience } from "@/components/account/flight-requests/customer-flight-requests-page";

export const metadata: Metadata = {
  title: "Flight Requests",
  description: "Track your managed Pluto Booking flight requests.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CustomerFlightRequestsPage() {
  return <CustomerFlightRequestsExperience />;
}
