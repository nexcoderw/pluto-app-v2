"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowLeft,
	Bath,
	BedDouble,
	Building2,
	CalendarCheck,
	CheckCircle2,
	ImageIcon,
	MapPin,
	RefreshCcw,
	ShieldCheck,
	Users,
	Wifi,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getApartmentListing,
	type PublicListing,
} from "@/services/api/listings";
import {
	formatBoolean,
	formatMoney,
	formatOptional,
	formatPricingUnit,
	getListingCoverImage,
} from "../listing-formatters";
import styles from "./apartment-listing-detail-page.module.css";

export function ApartmentListingDetailPage({
	listingId,
}: {
	listingId: string;
}) {
	const listingQuery = useQuery({
		queryKey: ["public-apartment-listing-detail", listingId],
		queryFn: () => getApartmentListing(listingId),
	});

	if (listingQuery.isPending) {
		return <ApartmentListingDetailSkeleton />;
	}

	if (listingQuery.isError || !listingQuery.data?.product) {
		return (
			<ApartmentListingDetailError onRetry={() => listingQuery.refetch()} />
		);
	}

	return <ApartmentListingDetail listing={listingQuery.data.product} />;
}

function ApartmentListingDetail({ listing }: { listing: PublicListing }) {
	const coverImage = getListingCoverImage(listing);
	const [activeImage, setActiveImage] = useState(
		coverImage?.file.publicUrl ?? null,
	);
	const heroImage = activeImage ?? coverImage?.file.publicUrl ?? null;
	const details = listing.apartmentDetails;
	const facts = useMemo(
		() => [
			{
				label: "Bedrooms",
				value: details ? String(details.bedrooms) : "Not listed",
				icon: BedDouble,
			},
			{
				label: "Bathrooms",
				value: details ? String(details.bathrooms) : "Not listed",
				icon: Bath,
			},
			{
				label: "Guests",
				value: details ? String(details.maxGuests) : "Not listed",
				icon: Users,
			},
			{
				label: "Kitchens",
				value: details ? String(details.kitchens) : "Not listed",
				icon: Building2,
			},
			{
				label: "WiFi",
				value: details ? formatBoolean(details.wifi) : "Not listed",
				icon: Wifi,
			},
			{
				label: "Furnished",
				value: details ? formatBoolean(details.furnished) : "Not listed",
				icon: CheckCircle2,
			},
		],
		[details],
	);
	const comforts = [
		{
			label: "Parking",
			value: details ? formatBoolean(details.parking) : "Not listed",
		},
		{
			label: "Balcony",
			value: details ? formatBoolean(details.hasBalcony) : "Not listed",
		},
		{
			label: "Security",
			value: details ? formatBoolean(details.hasSecurity) : "Not listed",
		},
		{ label: "Floor", value: formatOptional(details?.floorNumber) },
	];

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<div>
					<Link href="/listings/apartments" className={styles.backLink}>
						<ArrowLeft aria-hidden="true" />
						Back to apartments
					</Link>
					<span className={styles.eyebrow}>
						<Building2 aria-hidden="true" />
						Verified apartment
					</span>
					<h1>{listing.title}</h1>
					<p>
						<MapPin aria-hidden="true" />
						{listing.location?.addressLine ??
							`${listing.city}, ${listing.country}`}
					</p>
				</div>
				<div className={styles.pricePanel}>
					<span>Starting from</span>
					<strong>{formatMoney(listing.basePrice, listing.currency)}</strong>
					<small>per {formatPricingUnit(listing.pricingUnit)}</small>
				</div>
			</header>

			<section className={styles.layout}>
				<div className={styles.mainColumn}>
					<section className={styles.gallery}>
						<div className={styles.heroImage}>
							{heroImage ? (
								<Image
									src={heroImage}
									alt={coverImage?.altText ?? listing.title}
									fill
									sizes="(max-width: 900px) 100vw, 62vw"
									priority
								/>
							) : (
								<span>
									<ImageIcon aria-hidden="true" />
									Image coming soon
								</span>
							)}
						</div>
						{listing.images.length > 1 ? (
							<div className={styles.thumbnails}>
								{listing.images.map((image) => {
									const imageUrl = image.file.publicUrl;

									return (
										<button
											key={image.id}
											type="button"
											disabled={!imageUrl}
											data-active={imageUrl === heroImage}
											onClick={() => imageUrl && setActiveImage(imageUrl)}
										>
											{imageUrl ? (
												<Image
													src={imageUrl}
													alt={image.altText ?? listing.title}
													fill
													sizes="8rem"
												/>
											) : (
												<ImageIcon aria-hidden="true" />
											)}
										</button>
									);
								})}
							</div>
						) : null}
					</section>

					<section className={styles.descriptionPanel}>
						<div className={styles.sectionHeader}>
							<span>Overview</span>
							<h2>Apartment experience</h2>
						</div>
						<p>
							{listing.description ??
								listing.shortDescription ??
								"This approved Pluto Booking apartment is ready for customer review."}
						</p>
					</section>

					<section className={styles.factsPanel}>
						<div className={styles.sectionHeader}>
							<span>Apartment details</span>
							<h2>Space and amenities</h2>
						</div>
						<div className={styles.factGrid}>
							{facts.map((fact) => (
								<div key={fact.label} className={styles.factItem}>
									<fact.icon aria-hidden="true" />
									<span>{fact.label}</span>
									<strong>{fact.value}</strong>
								</div>
							))}
						</div>
					</section>

					<section className={styles.policyPanel}>
						<div className={styles.sectionHeader}>
							<span>Comfort</span>
							<h2>Included setup</h2>
						</div>
						<div className={styles.policyGrid}>
							{comforts.map((comfort) => (
								<div key={comfort.label}>
									<span>{comfort.label}</span>
									<strong>{comfort.value}</strong>
								</div>
							))}
						</div>
					</section>
				</div>

				<aside className={styles.sidebar}>
					<section className={styles.bookingPanel}>
						<span>
							<CalendarCheck aria-hidden="true" />
							Ready for booking
						</span>
						<h2>{formatMoney(listing.basePrice, listing.currency)}</h2>
						<p>per {formatPricingUnit(listing.pricingUnit)}</p>
						<Link href="/login">
							Sign in to book
							<CalendarCheck aria-hidden="true" />
						</Link>
					</section>

					<section className={styles.partnerPanel}>
						<span>
							<ShieldCheck aria-hidden="true" />
							Verified partner
						</span>
						<strong>{listing.owner.fullName}</strong>
						<p>
							This partner completed Pluto Booking review before publishing this
							apartment.
						</p>
					</section>
				</aside>
			</section>
		</main>
	);
}

function ApartmentListingDetailSkeleton() {
	return (
		<main className={styles.page}>
			<Link href="/listings/apartments" className={styles.backLink}>
				<ArrowLeft aria-hidden="true" />
				Back to apartments
			</Link>
			<section className={styles.layout}>
				<div className={styles.mainColumn}>
					<Skeleton className={styles.skeletonHero} />
					<Skeleton className={styles.skeletonLine} />
					<Skeleton className={styles.skeletonText} />
					<Skeleton className={styles.skeletonText} />
				</div>
				<aside className={styles.sidebar}>
					<Skeleton className={styles.skeletonPanel} />
				</aside>
			</section>
		</main>
	);
}

function ApartmentListingDetailError({ onRetry }: { onRetry: () => void }) {
	return (
		<main className={styles.page}>
			<section className={styles.statePanel}>
				<RefreshCcw aria-hidden="true" />
				<h1>Apartment unavailable</h1>
				<p>
					This apartment may have been removed, paused, or moved to another
					category.
				</p>
				<div>
					<Button type="button" onClick={onRetry}>
						<RefreshCcw aria-hidden="true" />
						Retry
					</Button>
					<Link href="/listings/apartments">
						<ArrowLeft aria-hidden="true" />
						Back to apartments
					</Link>
				</div>
			</section>
		</main>
	);
}
