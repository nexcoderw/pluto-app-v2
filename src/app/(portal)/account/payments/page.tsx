import type { Metadata } from "next";
import { CustomerPlaceholderPage } from "@/components/account/customer-placeholder-page";

export const metadata: Metadata = {
  title: "Payments | Pluto Booking",
  description: "Manage your Pluto Booking customer payment records.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CustomerPaymentsPage() {
  return (
    <CustomerPlaceholderPage
      title="Payments will appear here"
      description="Receipts, booking payment status, and customer billing activity will be available from this section."
    />
  );
}
