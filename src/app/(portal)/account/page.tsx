import type { Metadata } from "next";
import { AccountCustomerPortal } from "./account-customer-portal";

export const metadata: Metadata = {
  title: "Customer Dashboard | Pluto Booking",
  description: "Your Pluto Booking customer dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountPage() {
  return <AccountCustomerPortal />;
}
