import type { Metadata } from "next";
import { FlightRequestPage } from "@/components/flights/flight-request-page";

export const metadata: Metadata = {
  title: "Flight Requests | Pluto Booking",
  description:
    "Submit a secure managed flight booking request with Pluto Booking Africa.",
};

export default function FlightsPage() {
  return <FlightRequestPage />;
}
