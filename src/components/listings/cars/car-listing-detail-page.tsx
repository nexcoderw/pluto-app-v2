"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowLeft,
	BriefcaseBusiness,
	CalendarCheck,
	CarFront,
	CheckCircle2,
	Fuel,
	ImageIcon,
	MapPin,
	RefreshCcw,
	ShieldCheck,
	Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCarListing, type PublicListing } from "@/services/api/listings";
import {
	formatBoolean,
	formatMoney,
	formatOptional,
	formatPricingUnit,
	getListingCoverImage,
} from "../listing-formatters";
import styles from "./car-listing-detail-page.module.css";

export function CarListingDetailPage({ listingId }: { listingId: string }) {
	const listingQuery = useQuery({
		queryKey: ["public-car-listing-detail", listingId],
		queryFn: () => getCarListing(listingId),
	});

	if (listingQuery.isPending) {
		return <CarListingDetailSkeleton />;
	}

	if (listingQuery.isError || !listingQuery.data?.product) {
		return <CarListingDetailError onRetry={() => listingQuery.refetch()} />;
	}

	return <CarListingDetail listing={listingQuery.data.product} />;
}

function CarListingDetail({ listing }: { listing: PublicListing }) {
	const coverImage = getListingCoverImage(listing);
	const [activeImage, setActiveImage] = useState(
		coverImage?.file.publicUrl ?? null,
	);
	const heroImage = activeImage ?? coverImage?.file.publicUrl ?? null;
	const details = listing.carDetails;
	const facts = useMemo(
		() => [
			{
				label: "Vehicle",
				value: details ? `${details.brand} ${details.model}` : "Not listed",
				icon: CarFront,
			},
			{
				label: "Year",
				value: details ? String(details.year) : "Not listed",
				icon: CalendarCheck,
			},
			{
				label: "Transmission",
				value: formatOptional(details?.transmission),
				icon: BriefcaseBusiness,
			},
			{
				label: "Fuel",
				value: formatOptional(details?.fuelType),
				icon: Fuel,
			},
			{
				label: "Seats",
				value: details ? String(details.seats) : "Not listed",
				icon: Users,
			},
			{
				label: "Driver included",
				value: details ? formatBoolean(details.driverIncluded) : "Not listed",
				icon: CheckCircle2,
			},
		],
		[details],
	);
	const policies = [
		{
			label: "Insurance included",
			value: details ? formatBoolean(details.insuranceIncluded) : "Not listed",
		},
		{
			label: "Daily mileage",
			value: details?.mileageLimitPerDay
				? `${details.mileageLimitPerDay} km`
				: "Flexible",
		},
		{
			label: "Minimum driver age",
			value: details?.minimumDriverAge
				? `${details.minimumDriverAge}+`
				: "Ask partner",
		},
		{
			label: "Deposit",
			value: details?.requiresDeposit
				? formatMoney(details.depositAmount ?? "0", listing.currency)
				: "No deposit listed",
		},
	];

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<div>
					<Link href="/listings/cars" className={styles.backLink}>
						<ArrowLeft aria-hidden="true" />
						Back to cars
					</Link>
					<span className={styles.eyebrow}>
						<CarFront aria-hidden="true" />
						Verified car rental
					</span>
					<h1>{listing.title}</h1>
					<p>
						<MapPin aria-hidden="true" />
						{listing.city}, {listing.country}
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
							<h2>Vehicle experience</h2>
						</div>
						<p>
							{listing.description ??
								listing.shortDescription ??
								"This approved Pluto Booking car is ready for customer review."}
						</p>
					</section>

					<section className={styles.factsPanel}>
						<div className={styles.sectionHeader}>
							<span>Vehicle details</span>
							<h2>Specs and rental setup</h2>
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
							<span>Rental terms</span>
							<h2>Before you request this car</h2>
						</div>
						<div className={styles.policyGrid}>
							{policies.map((policy) => (
								<div key={policy.label}>
									<span>{policy.label}</span>
									<strong>{policy.value}</strong>
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
							car.
						</p>
					</section>
				</aside>
			</section>
		</main>
	);
}

function CarListingDetailSkeleton() {
	return (
		<main className={styles.page}>
			<Link href="/listings/cars" className={styles.backLink}>
				<ArrowLeft aria-hidden="true" />
				Back to cars
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

function CarListingDetailError({ onRetry }: { onRetry: () => void }) {
	return (
		<main className={styles.page}>
			<section className={styles.statePanel}>
				<RefreshCcw aria-hidden="true" />
				<h1>Car listing unavailable</h1>
				<p>
					This car may have been removed, paused, or moved to another category.
				</p>
				<div>
					<Button type="button" onClick={onRetry}>
						<RefreshCcw aria-hidden="true" />
						Retry
					</Button>
					<Link href="/listings/cars">
						<ArrowLeft aria-hidden="true" />
						Back to cars
					</Link>
				</div>
			</section>
		</main>
	);
}
