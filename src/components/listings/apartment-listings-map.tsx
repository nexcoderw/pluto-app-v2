"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Home, MapPin } from "lucide-react";
import {
	Map,
	MapControls,
	MapMarker,
	MarkerContent,
	useMap,
} from "@/components/ui/map";
import type { PublicListing } from "@/services/api/listings";
import styles from "./apartment-listings-map.module.css";

type ApartmentListingsMapProps = {
	listings: PublicListing[];
	detailBaseHref: string;
	isLoading?: boolean;
};

type ListingMapMarker = {
	id: string;
	title: string;
	city: string;
	country: string;
	priceLabel: string;
	priceMeta: string;
	detailHref: string;
	longitude: number;
	latitude: number;
};

const kigaliCenter: [number, number] = [30.0619, -1.9441];

export function ApartmentListingsMap({
	listings,
	detailBaseHref,
	isLoading = false,
}: ApartmentListingsMapProps) {
	const markers = useMemo(
		() =>
			listings
				.map((listing) => toListingMarker(listing, detailBaseHref))
				.filter((marker): marker is ListingMapMarker => Boolean(marker)),
		[listings, detailBaseHref],
	);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const selectedMarker =
		markers.find((marker) => marker.id === selectedId) ?? null;

	return (
		<aside
			className={styles.panel}
			aria-label="Apartment listings map"
			data-empty={markers.length === 0}
		>
			<div className={styles.mapCanvas}>
				<Map
					className={styles.mapViewport}
					center={kigaliCenter}
					zoom={11.3}
					pitch={28}
					bearing={-6}
					theme="light"
				>
					<ListingMapCamera markers={markers} selectedMarker={selectedMarker} />
					<MapControls
						position="top-right"
						showCompass
						showFullscreen
						className={styles.mapControls}
					/>
					{markers.map((marker) => (
						<MapMarker
							key={marker.id}
							longitude={marker.longitude}
							latitude={marker.latitude}
						>
							<MarkerContent className={styles.markerPortal}>
								<button
									type="button"
									className={styles.priceMarker}
									data-selected={marker.id === selectedMarker?.id}
									aria-label={`View ${marker.title} on map`}
									onClick={() => setSelectedId(marker.id)}
								>
									{marker.priceLabel}
								</button>
							</MarkerContent>
						</MapMarker>
					))}
				</Map>

				<div className={styles.mapSummary}>
					<span>
						<Home aria-hidden="true" />
						{markers.length}
					</span>
					<small>
						{markers.length === 1 ? "mapped apartment" : "mapped apartments"}
					</small>
				</div>

				{isLoading ? (
					<div className={styles.mapLoading}>
						<span />
						<p>Updating map results</p>
					</div>
				) : null}

				{markers.length === 0 && !isLoading ? (
					<div className={styles.mapEmpty}>
						<MapPin aria-hidden="true" />
						<strong>No mapped apartments</strong>
						<span>Listings with saved coordinates will appear here.</span>
					</div>
				) : null}

				{selectedMarker ? (
					<article className={styles.selectedCard}>
						<div>
							<span>
								<MapPin aria-hidden="true" />
								{selectedMarker.city}, {selectedMarker.country}
							</span>
							<strong>{selectedMarker.title}</strong>
							<p>{selectedMarker.priceMeta}</p>
						</div>
						<Link href={selectedMarker.detailHref}>
							Details
							<ArrowRight aria-hidden="true" />
						</Link>
					</article>
				) : null}
			</div>
		</aside>
	);
}

function ListingMapCamera({
	markers,
	selectedMarker,
}: {
	markers: ListingMapMarker[];
	selectedMarker: ListingMapMarker | null;
}) {
	const { map, isLoaded } = useMap();
	const markerKey = markers
		.map((marker) => `${marker.id}:${marker.longitude}:${marker.latitude}`)
		.join("|");

	useEffect(() => {
		if (!map || !isLoaded) return;

		if (selectedMarker) {
			map.flyTo({
				center: [selectedMarker.longitude, selectedMarker.latitude],
				zoom: Math.max(map.getZoom(), 13.4),
				duration: 700,
				essential: true,
			});
			return;
		}

		if (markers.length === 1) {
			map.flyTo({
				center: [markers[0].longitude, markers[0].latitude],
				zoom: 13,
				duration: 700,
				essential: true,
			});
			return;
		}

		if (markers.length > 1) {
			const bounds = markers.reduce(
				(current, marker) => ({
					minLng: Math.min(current.minLng, marker.longitude),
					minLat: Math.min(current.minLat, marker.latitude),
					maxLng: Math.max(current.maxLng, marker.longitude),
					maxLat: Math.max(current.maxLat, marker.latitude),
				}),
				{
					minLng: markers[0].longitude,
					minLat: markers[0].latitude,
					maxLng: markers[0].longitude,
					maxLat: markers[0].latitude,
				},
			);

			map.fitBounds(
				[
					[bounds.minLng, bounds.minLat],
					[bounds.maxLng, bounds.maxLat],
				],
				{
					padding: { top: 92, right: 72, bottom: 136, left: 72 },
					maxZoom: 14,
					duration: 700,
					essential: true,
				},
			);
		}
	}, [map, isLoaded, markerKey, markers, selectedMarker]);

	return null;
}

function toListingMarker(
	listing: PublicListing,
	detailBaseHref: string,
): ListingMapMarker | null {
	const latitude = Number(listing.location?.latitude);
	const longitude = Number(listing.location?.longitude);

	if (
		!Number.isFinite(latitude) ||
		!Number.isFinite(longitude) ||
		latitude < -90 ||
		latitude > 90 ||
		longitude < -180 ||
		longitude > 180
	) {
		return null;
	}

	const price = formatMoney(listing.basePrice, listing.currency);

	return {
		id: listing.id,
		title: listing.title,
		city: listing.location?.city || listing.city,
		country: listing.location?.country || listing.country,
		priceLabel: price,
		priceMeta: `${price} / ${listing.pricingUnit.toLowerCase()}`,
		detailHref: `${detailBaseHref}/${listing.id}`,
		longitude,
		latitude,
	};
}

function formatMoney(value: string, currency: string) {
	const amount = Number(value);

	if (!Number.isFinite(amount)) {
		return `${currency} ${value}`;
	}

	return new Intl.NumberFormat("en-RW", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount);
}
