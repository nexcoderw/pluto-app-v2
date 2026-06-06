"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	BedDouble,
	Building2,
	CarFront,
	Hotel,
	House,
	MapPin,
	RefreshCcw,
	Star,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
	listAirbnbListings,
	listApartmentListings,
	listCarListings,
	listHotelRoomListings,
	type ListingCategorySlug,
	type PublicListing,
} from "@/services/api/listings";
import {
	buildListingGallery,
	formatMoney,
} from "@/components/listings/listing-formatters";
import styles from "./featured-listings.module.css";

type FeaturedCategory = ListingCategorySlug | "all";

type FeaturedSource = {
	slug: ListingCategorySlug;
	label: string;
	href: string;
	icon: typeof CarFront;
	listDetailHref: (listingId: string) => string;
	listListings: () => Promise<{ items: PublicListing[] }>;
};

const featuredSources: FeaturedSource[] = [
	{
		slug: "cars",
		label: "Cars",
		href: "/listings/cars",
		icon: CarFront,
		listDetailHref: (listingId) => `/listings/cars/${listingId}`,
		listListings: () =>
			listCarListings({
				page: 1,
				limit: 3,
				sortBy: "createdAt",
				sortOrder: "desc",
			}),
	},
	{
		slug: "apartments",
		label: "Apartments",
		href: "/listings/apartments",
		icon: Building2,
		listDetailHref: (listingId) => `/listings/apartments/${listingId}`,
		listListings: () =>
			listApartmentListings({
				page: 1,
				limit: 3,
				sortBy: "createdAt",
				sortOrder: "desc",
			}),
	},
	{
		slug: "hotel-rooms",
		label: "Hotel Rooms",
		href: "/listings/hotel-rooms",
		icon: Hotel,
		listDetailHref: (listingId) => `/listings/hotel-rooms/${listingId}`,
		listListings: () =>
			listHotelRoomListings({
				page: 1,
				limit: 3,
				sortBy: "createdAt",
				sortOrder: "desc",
			}),
	},
	{
		slug: "airbnb",
		label: "Airbnb",
		href: "/listings/airbnb",
		icon: House,
		listDetailHref: (listingId) => `/listings/airbnb/${listingId}`,
		listListings: () =>
			listAirbnbListings({
				page: 1,
				limit: 3,
				sortBy: "createdAt",
				sortOrder: "desc",
			}),
	},
];

export function FeaturedListings() {
	const [activeCategory, setActiveCategory] = useState<FeaturedCategory>("all");
	const carsQuery = useFeaturedListingsQuery(featuredSources[0]);
	const apartmentsQuery = useFeaturedListingsQuery(featuredSources[1]);
	const hotelRoomsQuery = useFeaturedListingsQuery(featuredSources[2]);
	const airbnbQuery = useFeaturedListingsQuery(featuredSources[3]);
	const queries = [carsQuery, apartmentsQuery, hotelRoomsQuery, airbnbQuery];
	const cars = carsQuery.data?.items;
	const apartments = apartmentsQuery.data?.items;
	const hotelRooms = hotelRoomsQuery.data?.items;
	const airbnb = airbnbQuery.data?.items;
	const isLoading = queries.some((query) => query.isPending);
	const isError = queries.every((query) => query.isError);
	const featuredItems = useMemo(() => {
		const sourceItems = [cars, apartments, hotelRooms, airbnb];

		return featuredSources
			.flatMap((source, index) =>
				(sourceItems[index] ?? []).map((listing) => ({ source, listing })),
			)
			.sort(
				(first, second) =>
					getListingTime(second.listing) - getListingTime(first.listing),
			)
			.slice(0, 12);
	}, [airbnb, apartments, cars, hotelRooms]);
	const visibleItems =
		activeCategory === "all"
			? featuredItems
			: featuredItems.filter((item) => item.source.slug === activeCategory);
	const activeSource =
		activeCategory === "all"
			? null
			: featuredSources.find((source) => source.slug === activeCategory);

	function refetchAll() {
		queries.forEach((query) => {
			void query.refetch();
		});
	}

	return (
		<section className={styles.section} aria-labelledby="featured-listings">
			<div className={styles.header}>
				<div>
					<span>Featured listings</span>
					<h2 id="featured-listings">Real places and rentals ready to book</h2>
				</div>
				<Link
					href={activeSource?.href ?? "/listings"}
					className={styles.viewAll}
				>
					View all
					<ArrowRight aria-hidden="true" />
				</Link>
			</div>

			<div className={styles.tabs} aria-label="Featured listing categories">
				<CategoryTab
					label="All"
					isActive={activeCategory === "all"}
					onClick={() => setActiveCategory("all")}
				/>
				{featuredSources.map((source) => (
					<CategoryTab
						key={source.slug}
						label={source.label}
						isActive={activeCategory === source.slug}
						onClick={() => setActiveCategory(source.slug)}
					/>
				))}
			</div>

			{isLoading ? (
				<div className={styles.grid} aria-label="Loading featured listings">
					{Array.from({ length: 8 }).map((_, index) => (
						<FeaturedListingSkeleton key={index} />
					))}
				</div>
			) : isError ? (
				<div className={styles.state}>
					<RefreshCcw aria-hidden="true" />
					<h3>Featured listings could not load</h3>
					<p>Refresh this section to retrieve the latest approved inventory.</p>
					<button type="button" onClick={refetchAll}>
						<RefreshCcw aria-hidden="true" />
						Retry
					</button>
				</div>
			) : visibleItems.length ? (
				<div className={styles.grid}>
					{visibleItems.map(({ source, listing }) => (
						<FeaturedListingCard
							key={`${source.slug}-${listing.id}`}
							listing={listing}
							source={source}
						/>
					))}
				</div>
			) : (
				<div className={styles.state}>
					<BedDouble aria-hidden="true" />
					<h3>No featured listings yet</h3>
					<p>
						Approved listings will appear here as partners publish inventory.
					</p>
					<Link href={activeSource?.href ?? "/listings"}>
						Browse listings
						<ArrowRight aria-hidden="true" />
					</Link>
				</div>
			)}
		</section>
	);
}

function useFeaturedListingsQuery(source: FeaturedSource) {
	return useQuery({
		queryKey: ["home-featured-listings", source.slug],
		queryFn: source.listListings,
		staleTime: 60_000,
	});
}

function CategoryTab({
	label,
	isActive,
	onClick,
}: {
	label: string;
	isActive: boolean;
	onClick: () => void;
}) {
	return (
		<button type="button" data-active={isActive} onClick={onClick}>
			{label}
		</button>
	);
}

function FeaturedListingCard({
	listing,
	source,
}: {
	listing: PublicListing;
	source: FeaturedSource;
}) {
	const Icon = source.icon;
	const gallery = buildListingGallery(listing, listing.title);
	const cover = gallery[0];
	const detailHref = source.listDetailHref(listing.id);
	const location =
		listing.location?.addressLine ?? `${listing.city}, ${listing.country}`;
	const rating = listing.ratingAverage
		? Number(listing.ratingAverage).toFixed(1)
		: "New";

	return (
		<Link href={detailHref} className={styles.card}>
			<span className={styles.imageWrap}>
				<Image
					src={cover.src}
					alt={cover.alt}
					fill
					sizes="(max-width: 720px) 100vw, (max-width: 1180px) 50vw, 25vw"
				/>
				<span className={styles.badge}>
					<Icon aria-hidden="true" />
					{source.label}
				</span>
			</span>
			<span className={styles.cardBody}>
				<span className={styles.cardTopline}>
					<span>
						<MapPin aria-hidden="true" />
						{location}
					</span>
					<span>
						<Star aria-hidden="true" />
						{rating}
					</span>
				</span>
				<strong>{listing.title}</strong>
				<small>{listing.shortDescription ?? listing.description}</small>
				<span className={styles.cardFooter}>
					<span>
						{formatMoney(listing.basePrice, listing.currency)}
						<small>/{listing.pricingUnit.toLowerCase()}</small>
					</span>
					<i>
						View
						<ArrowRight aria-hidden="true" />
					</i>
				</span>
			</span>
		</Link>
	);
}

function FeaturedListingSkeleton() {
	return (
		<div className={styles.skeletonCard} aria-hidden="true">
			<span />
			<div>
				<i />
				<strong />
				<small />
				<em />
			</div>
		</div>
	);
}

function getListingTime(listing: PublicListing) {
	const value = listing.publishedAt ?? listing.createdAt ?? listing.updatedAt;

	return value ? new Date(value).getTime() : 0;
}
