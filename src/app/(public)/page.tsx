import type { Metadata } from "next";
import { HomePageExperience } from "@/components/home/home-page-experience";

export const metadata: Metadata = {
	title: "Pluto Booking | Verified Stays, Cars, and Rentals",
	description:
		"Search trusted cars, apartments, hotel rooms, and AirBnB-style stays from verified Pluto Booking partners.",
};

export default function HomePage() {
	return <HomePageExperience />;
}
