"use client";

import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	BookmarkCheck,
	Building2,
	CarFront,
	HeartOff,
	Hotel,
	House,
	MapPin,
	Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FavoriteListingSummary } from "@/services/api/favorites";
import {
	formatMoney,
	formatPricingUnit,
} from "@/components/listings/listing-formatters";
import styles from "./customer-favorites-page.module.css";

type FavoriteListingCardProps = {
	favorite: FavoriteListingSummary;
	onRemove: (favorite: FavoriteListingSummary) => void;
};

const categoryConfig = {
	CAR: {
		label: "Car rental",
		href: "/listings/cars",
		icon: CarFront,
	},
	APARTMENT: {
		label: "Apartment",
		href: "/listings/apartments",
		icon: Building2,
	},
	HOTEL_ROOM: {
		label: "Hotel room",
		href: "/listings/hotel-rooms",
		icon: Hotel,
	},
	AIRBNB_HOUSE: {
		label: "Airbnb stay",
		href: "/listings/airbnb",
		icon: House,
	},
} as const;

export function FavoriteListingCard({
	favorite,
	onRemove,
}: FavoriteListingCardProps) {
	const product = favorite.product;
	const category = categoryConfig[product.category];
	const CategoryIcon = category.icon;
	const coverImage =
		product.images.find((image) => image.isCover) ?? product.images[0];
	const coverUrl = coverImage?.file.publicUrl ?? "/hero/hero.jpg";
	const detailHref = `${category.href}/${product.id}`;
	const savedDate = formatSavedDate(favorite.createdAt);
	const location = `${product.city}, ${product.country}`;
	const description =
		product.shortDescription ??
		"Saved listing ready for your next booking comparison.";

	return (
		<article className={styles.card}>
			<div className={styles.favoriteMediaFrame}>
				<Link href={detailHref} className={styles.media}>
					<Image
						src={coverUrl}
						alt={coverImage?.altText ?? product.title}
						fill
						sizes="(max-width: 720px) 100vw, (max-width: 1180px) 45vw, 28vw"
					/>
					<span className={styles.mediaShade} aria-hidden="true" />
					<span className={styles.categoryPill}>
						<CategoryIcon aria-hidden="true" />
						{category.label}
					</span>
					<span className={styles.imageCaption}>
						<span>
							<strong>{product.title}</strong>
							<small>
								<MapPin aria-hidden="true" />
								{location}
							</small>
						</span>
						<span className={styles.imageAction}>
							Open
							<ArrowRight aria-hidden="true" />
						</span>
					</span>
				</Link>

				<Button
					type="button"
					variant="ghost"
					size="icon"
					className={styles.removeIconButton}
					aria-label={`Remove ${product.title} from favorites`}
					onClick={() => onRemove(favorite)}
				>
					<Trash2 aria-hidden="true" />
				</Button>
			</div>

			<div className={styles.cardBody}>
				<div className={styles.cardMeta}>
					<span className={styles.metric}>
						<strong>{formatMoney(product.basePrice, product.currency)}</strong>
						<small>{formatPricingUnit(product.pricingUnit)} rate</small>
					</span>
					<span className={styles.metric}>
						<strong>{savedDate}</strong>
						<small>Saved</small>
					</span>
					<span className={styles.metric}>
						<strong>{category.label}</strong>
						<small>Type</small>
					</span>
				</div>

				<div className={styles.savedPanel}>
					<BookmarkCheck aria-hidden="true" />
					<span>
						<strong>Saved for later</strong>
						<small>{description}</small>
					</span>
					<Link href={detailHref} className={styles.detailsLink}>
						Details
					</Link>
				</div>
			</div>
		</article>
	);
}

export function FavoriteListingEmptyCard() {
	return (
		<section className={styles.emptyState}>
			<span aria-hidden="true">
				<HeartOff />
			</span>
			<h2>No saved listings yet</h2>
			<p>
				Save cars, apartments, hotel rooms, and Airbnb stays to compare them
				here before booking.
			</p>
			<Link href="/listings/cars">
				Start browsing
				<ArrowRight aria-hidden="true" />
			</Link>
		</section>
	);
}

function formatSavedDate(value: string) {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "Saved";
	}

	return new Intl.DateTimeFormat("en-RW", {
		day: "numeric",
		month: "short",
		timeZone: "Africa/Kigali",
	}).format(date);
}
