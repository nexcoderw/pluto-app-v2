"use client";

import { MapPin } from "lucide-react";
import type { StyleSpecification } from "maplibre-gl";
import {
	Map,
	MapControls,
	MapMarker,
	MarkerContent,
} from "@/components/ui/map";
import { Skeleton } from "@/components/ui/skeleton";
import type { PublicListing } from "@/services/api/listings";
import styles from "./listing-location-map.module.css";

type ListingLocationMapProps = {
	listing: PublicListing;
	locationLabel: string;
	ariaLabel: string;
	unavailableDescription: string;
};

const kigaliCenter: [number, number] = [30.0619, -1.9441];
const kigaliNeighborhoods: Array<{
	keywords: string[];
	position: [number, number];
}> = [
	{ keywords: ["kimihurura"], position: [30.0894, -1.9507] },
	{ keywords: ["nyarutarama"], position: [30.1037, -1.9336] },
	{ keywords: ["kacyiru"], position: [30.0706, -1.9367] },
	{ keywords: ["kiyovu"], position: [30.0619, -1.9548] },
	{ keywords: ["kibagabaga"], position: [30.113, -1.937] },
	{ keywords: ["gacuriro"], position: [30.092, -1.925] },
	{ keywords: ["remera"], position: [30.102, -1.959] },
	{ keywords: ["kanombe"], position: [30.137, -1.972] },
	{ keywords: ["kicukiro"], position: [30.103, -2.001] },
	{ keywords: ["kagugu"], position: [30.083, -1.911] },
];

const listingDetailMapStyle: StyleSpecification = {
	version: 8,
	sources: {
		"osm-street-raster": {
			type: "raster",
			tiles: ["/api/map-tiles/osm/{z}/{x}/{y}"],
			tileSize: 256,
			attribution: "© OpenStreetMap contributors",
		},
	},
	layers: [
		{
			id: "street-map-background",
			type: "background",
			paint: {
				"background-color": "#eef0f6",
			},
		},
		{
			id: "osm-street-raster",
			type: "raster",
			source: "osm-street-raster",
			minzoom: 0,
			maxzoom: 20,
			paint: {
				"raster-opacity": 0.96,
				"raster-saturation": -0.18,
				"raster-contrast": 0.06,
			},
		},
	],
};

export function ListingLocationMap({
	listing,
	locationLabel,
	ariaLabel,
	unavailableDescription,
}: ListingLocationMapProps) {
	const latitude = Number(listing.location?.latitude);
	const longitude = Number(listing.location?.longitude);
	const hasExactPosition = isValidCoordinatePair(longitude, latitude);
	const fallbackPosition = getFallbackPosition(listing);
	const mapPosition = hasExactPosition
		? { longitude, latitude, isApproximate: false }
		: fallbackPosition
			? {
					longitude: fallbackPosition[0],
					latitude: fallbackPosition[1],
					isApproximate: true,
				}
			: null;
	const mapCenter: [number, number] = mapPosition
		? [mapPosition.longitude, mapPosition.latitude]
		: kigaliCenter;
	const directionsUrl = hasExactPosition
		? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
		: null;

	return (
		<section className={styles.section} aria-label={ariaLabel}>
			<div className={styles.header}>
				<div>
					<span>
						<MapPin aria-hidden="true" />
						Map location
					</span>
					<h2>{locationLabel}</h2>
				</div>
				{directionsUrl ? (
					<a href={directionsUrl} target="_blank" rel="noreferrer">
						<MapPin aria-hidden="true" />
						Open directions
					</a>
				) : null}
			</div>

			<div
				className={styles.canvas}
				data-exact={hasExactPosition}
				data-approximate={Boolean(mapPosition?.isApproximate)}
			>
				{mapPosition ? (
					<Map
						className={styles.viewport}
						center={mapCenter}
						zoom={mapPosition.isApproximate ? 12.3 : 14.2}
						pitch={22}
						bearing={-4}
						theme="light"
						styles={{
							light: listingDetailMapStyle,
							dark: listingDetailMapStyle,
						}}
					>
						<MapControls
							position="top-right"
							showCompass
							showFullscreen
							className={styles.controls}
						/>
						<MapMarker
							longitude={mapPosition.longitude}
							latitude={mapPosition.latitude}
						>
							<MarkerContent className={styles.markerPortal}>
								<span
									className={styles.marker}
									data-approximate={mapPosition.isApproximate}
								>
									<MapPin aria-hidden="true" />
								</span>
							</MarkerContent>
						</MapMarker>
					</Map>
				) : (
					<div className={styles.unavailable}>
						<MapPin aria-hidden="true" />
						<strong>Map coordinates unavailable</strong>
						<p>{unavailableDescription}</p>
					</div>
				)}
				{mapPosition?.isApproximate ? (
					<div className={styles.approximateNote}>
						<MapPin aria-hidden="true" />
						<span>
							Approximate area based on the listing location. Confirm the exact
							address before check-in.
						</span>
					</div>
				) : null}
			</div>
		</section>
	);
}

export function ListingLocationMapSkeleton() {
	return (
		<section className={styles.section} aria-busy="true">
			<div className={styles.header}>
				<div>
					<Skeleton className={styles.skeletonSectionLabel} />
					<Skeleton className={styles.skeletonParagraphShort} />
				</div>
				<Skeleton className={styles.skeletonBackLink} />
			</div>
			<Skeleton className={styles.skeletonMap} />
		</section>
	);
}

function isValidCoordinatePair(longitude: number, latitude: number) {
	return (
		Number.isFinite(latitude) &&
		Number.isFinite(longitude) &&
		latitude >= -90 &&
		latitude <= 90 &&
		longitude >= -180 &&
		longitude <= 180
	);
}

function getFallbackPosition(listing: PublicListing): [number, number] | null {
	const searchableText = [
		listing.title,
		listing.shortDescription,
		listing.description,
		listing.location?.name,
		listing.location?.addressLine,
		listing.location?.city,
		listing.city,
	]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
	const neighborhood = kigaliNeighborhoods.find((item) =>
		item.keywords.some((keyword) => searchableText.includes(keyword)),
	);

	if (neighborhood) {
		return neighborhood.position;
	}

	if (
		[
			listing.location?.city,
			listing.city,
			listing.location?.country,
			listing.country,
		]
			.filter(Boolean)
			.join(" ")
			.toLowerCase()
			.includes("kigali")
	) {
		return deterministicKigaliOffset(listing.id);
	}

	return null;
}

function deterministicKigaliOffset(listingId: string): [number, number] {
	const hash = Array.from(listingId).reduce(
		(total, char) => total + char.charCodeAt(0),
		0,
	);
	const angle = (hash % 360) * (Math.PI / 180);
	const radius = 0.012 + (hash % 9) * 0.002;

	return [
		Number((kigaliCenter[0] + Math.cos(angle) * radius).toFixed(6)),
		Number((kigaliCenter[1] + Math.sin(angle) * radius).toFixed(6)),
	];
}
