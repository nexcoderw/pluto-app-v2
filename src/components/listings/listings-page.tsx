"use client";

import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	Building2,
	CarFront,
	Hotel,
	House,
	ImageIcon,
	Images,
	RefreshCcw,
	ShieldCheck,
} from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	listAirbnbListings,
	listApartmentListings,
	listCarListings,
	listHotelRoomListings,
	type ListingListRequest,
	type ListingListResponse,
	type PublicListing,
} from "@/services/api/listings";
import styles from "./listings-page.module.css";

type CategoryConfig = {
	key: "cars" | "apartments" | "hotel-rooms" | "airbnb";
	label: string;
	description: string;
	href: string;
	icon: typeof CarFront;
	listListings: (params: ListingListRequest) => Promise<ListingListResponse>;
};

type CategoryImage = {
	id: string;
	url: string;
	alt: string;
};

const categoryConfigs: CategoryConfig[] = [
	{
		key: "cars",
		label: "Cars",
		description: "Verified vehicles for city trips, business travel, and longer journeys.",
		href: "/listings/cars",
		icon: CarFront,
		listListings: listCarListings,
	},
	{
		key: "apartments",
		label: "Apartments",
		description: "Comfortable apartments for flexible short and extended stays.",
		href: "/listings/apartments",
		icon: Building2,
		listListings: listApartmentListings,
	},
	{
		key: "hotel-rooms",
		label: "Hotel rooms",
		description: "Professionally hosted rooms with the essentials clearly explained.",
		href: "/listings/hotel-rooms",
		icon: Hotel,
		listListings: listHotelRoomListings,
	},
	{
		key: "airbnb",
		label: "Airbnb homes",
		description: "Distinctive homes for private, relaxed, and memorable stays.",
		href: "/listings/airbnb",
		icon: House,
		listListings: listAirbnbListings,
	},
];

const previewRequest: ListingListRequest = {
	page: 1,
	limit: 8,
	sortBy: "createdAt",
	sortOrder: "desc",
};

export function ListingsPage() {
	const categoryQueries = useQueries({
		queries: categoryConfigs.map((category) => ({
			queryKey: ["public-listing-category-preview", category.key],
			queryFn: () => category.listListings(previewRequest),
			staleTime: 60_000,
		})),
	});
	const isSummaryLoading = categoryQueries.some((query) => query.isPending);
	const hasSummaryError = categoryQueries.some((query) => query.isError);
	const totalListings = categoryQueries.reduce(
		(total, query) => total + (query.data?.meta.total ?? 0),
		0,
	);

	return (
		<main className={styles.page}>
			<section className={styles.hero}>
				<div className={styles.heroCopy}>
					<span className={styles.eyebrow}>
						<ShieldCheck aria-hidden="true" />
						Reviewed marketplace
					</span>
					<h1>Choose what you want to book.</h1>
					<p>
						Explore every category at a glance, then open the collection that
						matches your trip.
					</p>
				</div>
				<div className={styles.heroMetric} aria-label="Marketplace listing total">
					<Images aria-hidden="true" />
					<div>
						{isSummaryLoading ? (
							<Skeleton className={styles.metricSkeleton} />
						) : (
							<strong>{hasSummaryError ? "—" : formatCount(totalListings)}</strong>
						)}
						<span>
							{hasSummaryError
								? "Some category counts need to be retried"
								: "approved listings across four categories"}
						</span>
					</div>
				</div>
			</section>

			<section className={styles.sectionHeading}>
				<div>
					<span>Browse by category</span>
					<h2>Start with the experience you need</h2>
				</div>
				<p>Every preview below comes from currently published category inventory.</p>
			</section>

			<section className={styles.grid} aria-label="Listing categories">
				{categoryConfigs.map((category, index) => {
					const query = categoryQueries[index];

					if (query.isPending) {
						return <CategoryCardSkeleton key={category.key} />;
					}

					if (query.isError) {
						return (
							<CategoryErrorCard
								key={category.key}
								category={category}
								onRetry={() => query.refetch()}
							/>
						);
					}

					return (
						<CategoryCard
							key={category.key}
							category={category}
							listings={query.data.items}
							total={query.data.meta.total}
						/>
					);
				})}
			</section>
		</main>
	);
}

function CategoryCard({
	category,
	listings,
	total,
}: {
	category: CategoryConfig;
	listings: PublicListing[];
	total: number;
}) {
	const CategoryIcon = category.icon;
	const images = getCategoryImages(listings);

	return (
		<article className={styles.card} data-category={category.key}>
			<CategoryGallery images={images} categoryLabel={category.label} />
			<div className={styles.cardBody}>
				<div className={styles.cardHeading}>
					<span className={styles.iconWrap}>
						<CategoryIcon aria-hidden="true" />
					</span>
					<div>
						<h3>{category.label}</h3>
						<strong>{formatListingCount(total)}</strong>
					</div>
				</div>
				<p>{category.description}</p>
				<Link
					className={styles.categoryLink}
					href={category.href}
					aria-label={`Browse ${category.label}`}
				>
					Browse {category.label}
					<ArrowRight aria-hidden="true" />
				</Link>
			</div>
		</article>
	);
}

function CategoryGallery({
	images,
	categoryLabel,
}: {
	images: CategoryImage[];
	categoryLabel: string;
}) {
	return (
		<div className={styles.gallery} aria-label={`${categoryLabel} listing previews`}>
			{Array.from({ length: 4 }).map((_, index) => {
				const image = images[index];

				return (
					<div className={styles.galleryTile} key={image?.id ?? `empty-${index}`}>
						{image ? (
							<Image
								src={image.url}
								alt={image.alt}
								fill
								sizes="(max-width: 760px) 50vw, 25vw"
							/>
						) : (
							<span className={styles.imagePlaceholder}>
								<ImageIcon aria-hidden="true" />
								<small>Photo unavailable</small>
							</span>
						)}
					</div>
				);
			})}
		</div>
	);
}

function CategoryErrorCard({
	category,
	onRetry,
}: {
	category: CategoryConfig;
	onRetry: () => void;
}) {
	const CategoryIcon = category.icon;

	return (
		<article className={styles.card} data-category={category.key}>
			<CategoryGallery images={[]} categoryLabel={category.label} />
			<div className={styles.cardBody}>
				<div className={styles.cardHeading}>
					<span className={styles.iconWrap}>
						<CategoryIcon aria-hidden="true" />
					</span>
					<div>
						<h3>{category.label}</h3>
						<strong>Count unavailable</strong>
					</div>
				</div>
				<p>We could not load this category preview. Your other categories remain available.</p>
				<Button type="button" variant="outline" onClick={onRetry}>
					<RefreshCcw aria-hidden="true" />
					Retry {category.label}
				</Button>
			</div>
		</article>
	);
}

function CategoryCardSkeleton() {
	return (
		<article className={styles.skeletonCard} aria-label="Loading listing category">
			<div className={styles.skeletonGallery}>
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className={styles.skeletonTile} />
				))}
			</div>
			<div className={styles.skeletonBody}>
				<Skeleton className={styles.skeletonTitle} />
				<Skeleton className={styles.skeletonText} />
				<Skeleton className={styles.skeletonTextShort} />
				<Skeleton className={styles.skeletonButton} />
			</div>
		</article>
	);
}

function getCategoryImages(listings: PublicListing[]): CategoryImage[] {
	const preferredImages = listings.flatMap((listing) => {
		const image = listing.images.find((candidate) => candidate.isCover) ?? listing.images[0];

		return image ? [{ image, listing }] : [];
	});
	const additionalImages = listings.flatMap((listing) =>
		listing.images.map((image) => ({ image, listing })),
	);
	const candidates = [...preferredImages, ...additionalImages].map(
		({ image, listing }) => ({
			id: image.id,
			url: image.file.publicUrl,
			alt: image.altText?.trim() || `${listing.title} in ${listing.city}`,
		}),
	);
	const seenUrls = new Set<string>();

	return candidates
		.filter((image): image is CategoryImage => {
			if (!image.url || seenUrls.has(image.url)) return false;
			seenUrls.add(image.url);
			return true;
		})
		.slice(0, 4);
}

function formatListingCount(total: number) {
	return `${formatCount(total)} ${total === 1 ? "listing" : "listings"}`;
}

function formatCount(value: number) {
	return new Intl.NumberFormat("en-RW").format(value);
}
