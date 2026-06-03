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
import { AirbnbListingCard } from "./airbnb/airbnb-listing-card";
import { AirbnbListingsSidebar } from "./airbnb/airbnb-listings-sidebar";
import { airbnbFilters } from "./airbnb/filters";
import { ApartmentListingCard } from "./apartments/apartment-listing-card";
import { ApartmentListingsSidebar } from "./apartments/apartment-listings-sidebar";
import { apartmentFilters } from "./apartments/filters";
import {
	CategoryListingsPage,
	type ListingSidebarFilter,
	type ListingSidebarRenderProps,
} from "./category-listings-page";
import {
	CarListingCard,
	CarListingCardSkeleton,
} from "./cars/car-listing-card";
import { CarListingsSidebar } from "./cars/car-listings-sidebar";
import { carFilters } from "./cars/filters";
import { hotelRoomFilters } from "./hotel-rooms/filters";
import {
	HotelRoomListingCard,
	HotelRoomListingCardSkeleton,
} from "./hotel-rooms/hotel-room-listing-card";
import { HotelRoomListingsSidebar } from "./hotel-rooms/hotel-room-listings-sidebar";

type CategoryConfig = {
	categoryLabel: string;
	title: string;
	detailBaseHref: string;
	filters: ListingSidebarFilter[];
	listListings: (params: ListingListRequest) => Promise<ListingListResponse>;
	renderCard: (
		listing: PublicListing,
		detailHref: string,
		index: number,
	) => ReactNode;
	renderSkeletonCard?: (index: number) => ReactNode;
	renderSidebar?: (props: ListingSidebarRenderProps) => ReactNode;
	filterPresentation?: "sidebar" | "dialog";
};

const categoryConfigs = {
	cars: {
		categoryLabel: "Cars",
		title: "Cars",
		detailBaseHref: "/listings/cars",
		filters: carFilters,
		listListings: listCarListings,
		renderSidebar: (sidebarProps) => <CarListingsSidebar {...sidebarProps} />,
		renderSkeletonCard: (index) => <CarListingCardSkeleton key={index} />,
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
		title: "Apartments",
		detailBaseHref: "/listings/apartments",
		filters: apartmentFilters,
		listListings: listApartmentListings,
		filterPresentation: "dialog",
		renderSidebar: (sidebarProps) => (
			<ApartmentListingsSidebar {...sidebarProps} variant="dialog" />
		),
		renderCard: (listing, detailHref, index) => (
			<ApartmentListingCard
				key={listing.id}
				listing={listing}
				detailHref={detailHref}
				priorityImage={index === 0}
			/>
		),
	},
	"hotel-rooms": {
		categoryLabel: "Hotel rooms",
		title: "Hotel Rooms",
		detailBaseHref: "/listings/hotel-rooms",
		filters: hotelRoomFilters,
		listListings: listHotelRoomListings,
		filterPresentation: "dialog",
		renderSidebar: (sidebarProps) => (
			<HotelRoomListingsSidebar {...sidebarProps} variant="dialog" />
		),
		renderSkeletonCard: (index) => <HotelRoomListingCardSkeleton key={index} />,
		renderCard: (listing, detailHref, index) => (
			<HotelRoomListingCard
				key={listing.id}
				listing={listing}
				detailHref={detailHref}
				priorityImage={index === 0}
			/>
		),
	},
	airbnb: {
		categoryLabel: "AirBnB",
		title: "Discover AirBnB-style homes built for secure stays.",
		detailBaseHref: "/listings/airbnb",
		filters: airbnbFilters,
		listListings: listAirbnbListings,
		filterPresentation: "dialog",
		renderSidebar: (sidebarProps) => (
			<AirbnbListingsSidebar {...sidebarProps} variant="dialog" />
		),
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
