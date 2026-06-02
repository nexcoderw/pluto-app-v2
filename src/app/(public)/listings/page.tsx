import type { Metadata } from "next";
import { ListingsPage } from "@/components/listings/listings-page";

export const metadata: Metadata = {
	title: "Listings",
	description:
		"Search approved cars, apartments, hotel rooms, and Airbnb homes on Pluto Booking.",
};

export default function ListingsRoute() {
	return <ListingsPage />;
}
