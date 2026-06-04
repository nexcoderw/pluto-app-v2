"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowLeft,
	Bath,
	BedDouble,
	CalendarCheck,
	CheckCircle2,
	House,
	ImageIcon,
	KeyRound,
	MapPin,
	RefreshCcw,
	ShieldCheck,
	Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAirbnbListing, type PublicListing } from "@/services/api/listings";
import {
	formatBoolean,
	formatMoney,
	formatOptional,
	formatPricingUnit,
	getListingCoverImage,
} from "../listing-formatters";
import styles from "./airbnb-listing-detail-page.module.css";

export function AirbnbListingDetailPage({ listingId }: { listingId: string }) {
	const listingQuery = useQuery({
		queryKey: ["public-airbnb-listing-detail", listingId],
		queryFn: () => getAirbnbListing(listingId),
	});

	if (listingQuery.isPending) return <AirbnbListingDetailSkeleton />;

	if (listingQuery.isError || !listingQuery.data?.product) {
		return <AirbnbListingDetailError onRetry={() => listingQuery.refetch()} />;
	}

	return <AirbnbListingDetail listing={listingQuery.data.product} />;
}

function AirbnbListingDetail({ listing }: { listing: PublicListing }) {
	const coverImage = getListingCoverImage(listing);
	const [activeImage, setActiveImage] = useState(
		coverImage?.file.publicUrl ?? null,
	);
	const heroImage = activeImage ?? coverImage?.file.publicUrl ?? null;
	const details = listing.airbnbDetails;
	const facts = useMemo(
		() => [
			{
				label: "Home type",
				value: formatOptional(details?.houseType),
				icon: House,
			},
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
				label: "Entire place",
				value: details ? formatBoolean(details.entirePlace) : "Not listed",
				icon: CheckCircle2,
			},
			{
				label: "Self check-in",
				value: details ? formatBoolean(details.selfCheckIn) : "Not listed",
				icon: KeyRound,
			},
		],
		[details],
	);
	const houseRules = [
		{
			label: "Pets",
			value: details ? formatBoolean(details.allowPets) : "Not listed",
		},
		{
			label: "Smoking",
			value: details ? formatBoolean(details.allowSmoking) : "Not listed",
		},
		{
			label: "Parties",
			value: details ? formatBoolean(details.allowParties) : "Not listed",
		},
		{
			label: "Cleaning fee",
			value: details?.cleaningFee
				? formatMoney(details.cleaningFee, listing.currency)
				: "Not listed",
		},
	];

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<div>
					<Link href="/listings/airbnb" className={styles.backLink}>
						<ArrowLeft aria-hidden="true" />
						Back to AirBnB homes
					</Link>
					<span className={styles.eyebrow}>
						<House aria-hidden="true" />
						Verified private stay
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
							<h2>Private stay experience</h2>
						</div>
						<p>
							{listing.description ??
								listing.shortDescription ??
								"This approved Pluto Booking Airbnb-style stay is ready for customer review."}
						</p>
					</section>

					<section className={styles.factsPanel}>
						<div className={styles.sectionHeader}>
							<span>Home details</span>
							<h2>Space and access</h2>
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
							<span>House rules</span>
							<h2>Before you request this stay</h2>
						</div>
						<div className={styles.policyGrid}>
							{houseRules.map((rule) => (
								<div key={rule.label}>
									<span>{rule.label}</span>
									<strong>{rule.value}</strong>
								</div>
							))}
						</div>
						{details?.houseRules ? (
							<p className={styles.ruleCopy}>{details.houseRules}</p>
						) : null}
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
							private stay.
						</p>
					</section>
				</aside>
			</section>
		</main>
	);
}

function AirbnbListingDetailSkeleton() {
	return (
		<main className={styles.page}>
			<Link href="/listings/airbnb" className={styles.backLink}>
				<ArrowLeft aria-hidden="true" />
				Back to AirBnB homes
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

function AirbnbListingDetailError({ onRetry }: { onRetry: () => void }) {
	return (
		<main className={styles.page}>
			<section className={styles.statePanel}>
				<RefreshCcw aria-hidden="true" />
				<h1>AirBnB stay unavailable</h1>
				<p>
					This stay may have been removed, paused, or moved to another category.
				</p>
				<div>
					<Button type="button" onClick={onRetry}>
						<RefreshCcw aria-hidden="true" />
						Retry
					</Button>
					<Link href="/listings/airbnb">
						<ArrowLeft aria-hidden="true" />
						Back to AirBnB homes
					</Link>
				</div>
			</section>
		</main>
	);
}
