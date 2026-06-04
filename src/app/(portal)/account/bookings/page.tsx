import type { Metadata } from "next";
import { CustomerPlaceholderPage } from "@/components/account/customer-placeholder-page";

export const metadata: Metadata = {
  title: "Bookings | Pluto Booking",
  description: "View your Pluto Booking customer reservations.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CustomerBookingsPage() {
  return (
    <CustomerPlaceholderPage
      title="Bookings will appear here"
      description="Your confirmed reservations, pending booking requests, and trip history will be organized in this workspace."
    />
  );
}
