"use client";

import type { ReactNode } from "react";
import {
	listAirbnbListings,
	listApartmentListings,
	listCarListings,
	listHotelRoomListings,
	type ListingCategorySlug,
	type ListingListRequest,
	type ListingListResponse,
	type PublicListing,
} from "@/services/api/listings";
import {
	AirbnbListingCard,
	ApartmentListingCard,
	HotelRoomListingCard,
} from "./category-listing-cards";
import {
	CategoryListingsPage,
	type ListingSidebarFilter,
} from "./category-listings-page";
import { CarListingCard } from "./car-listing-card";

type CategoryConfig = {
	categoryLabel: string;
	title: string;
	detailBaseHref: string;
	filters: ListingSidebarFilter[];
	listListings: (params: ListingListRequest) => Promise<ListingListResponse>;
	renderCard: (listing: PublicListing, detailHref: string) => ReactNode;
};

const carFilters: ListingSidebarFilter[] = [
	{ key: "make", label: "Make", kind: "text", placeholder: "Toyota" },
	{ key: "model", label: "Model", kind: "text", placeholder: "RAV4" },
	{ key: "transmission", label: "Transmission", kind: "text" },
	{ key: "fuelType", label: "Fuel type", kind: "text" },
	{ key: "seats", label: "Minimum seats", kind: "number" },
	{ key: "minYear", label: "Minimum year", kind: "number" },
];

const apartmentFilters: ListingSidebarFilter[] = [
	{ key: "bedrooms", label: "Bedrooms", kind: "number" },
	{ key: "bathrooms", label: "Bathrooms", kind: "number" },
	{ key: "guests", label: "Guests", kind: "number" },
	{ key: "furnished", label: "Furnished", kind: "boolean" },
	{ key: "wifi", label: "WiFi", kind: "boolean" },
	{ key: "parking", label: "Parking", kind: "boolean" },
];

const hotelRoomFilters: ListingSidebarFilter[] = [
	{ key: "roomType", label: "Room type", kind: "text" },
	{ key: "bedType", label: "Bed type", kind: "text" },
	{ key: "guests", label: "Guests", kind: "number" },
	{ key: "breakfastIncluded", label: "Breakfast", kind: "boolean" },
];

const airbnbFilters: ListingSidebarFilter[] = [
	{ key: "propertyType", label: "Property type", kind: "text" },
	{ key: "bedrooms", label: "Bedrooms", kind: "number" },
	{ key: "bathrooms", label: "Bathrooms", kind: "number" },
	{ key: "guests", label: "Guests", kind: "number" },
	{ key: "entirePlace", label: "Entire place", kind: "boolean" },
	{ key: "selfCheckIn", label: "Self check-in", kind: "boolean" },
	{ key: "allowPets", label: "Pets allowed", kind: "boolean" },
];

const categoryConfigs = {
	cars: {
		categoryLabel: "Cars",
		title: "Choose road-ready cars from approved Pluto partners.",
		detailBaseHref: "/listings/cars",
		filters: carFilters,
		listListings: listCarListings,
		renderCard: (listing, detailHref) => (
			<CarListingCard
				key={listing.id}
				listing={listing}
				detailHref={detailHref}
			/>
		),
	},
	apartments: {
		categoryLabel: "Apartments",
		title: "Find comfortable apartments with the details already checked.",
		detailBaseHref: "/listings/apartments",
		filters: apartmentFilters,
		listListings: listApartmentListings,
		renderCard: (listing, detailHref) => (
			<ApartmentListingCard
				key={listing.id}
				listing={listing}
				detailHref={detailHref}
			/>
		),
	},
	"hotel-rooms": {
		categoryLabel: "Hotel rooms",
		title: "Book hotel rooms with room details visible upfront.",
		detailBaseHref: "/listings/hotel-rooms",
		filters: hotelRoomFilters,
		listListings: listHotelRoomListings,
		renderCard: (listing, detailHref) => (
			<HotelRoomListingCard
				key={listing.id}
				listing={listing}
				detailHref={detailHref}
			/>
		),
	},
	airbnb: {
		categoryLabel: "AirBnB homes",
		title: "Discover AirBnB-style homes built for secure stays.",
		detailBaseHref: "/listings/airbnb",
		filters: airbnbFilters,
		listListings: listAirbnbListings,
		renderCard: (listing, detailHref) => (
			<AirbnbListingCard
				key={listing.id}
				listing={listing}
				detailHref={detailHref}
			/>
		),
	},
} satisfies Record<ListingCategorySlug, CategoryConfig>;

export function CategoryListingsRoute({
	categorySlug,
}: {
	categorySlug: ListingCategorySlug;
}) {
	const config = categoryConfigs[categorySlug];

	return <CategoryListingsPage categorySlug={categorySlug} {...config} />;
}
