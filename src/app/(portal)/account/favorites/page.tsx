import type { Metadata } from "next";
import { CustomerPlaceholderPage } from "@/components/account/customer-placeholder-page";

export const metadata: Metadata = {
  title: "Favorites | Pluto Booking",
  description: "Review your saved Pluto Booking listings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CustomerFavoritesPage() {
  return (
    <CustomerPlaceholderPage
      title="Favorites will appear here"
      description="Cars, apartments, hotel rooms, and Airbnb stays you save will be collected here for easy comparison."
    />
  );
}
