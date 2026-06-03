"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Home, MapPin } from "lucide-react";
import type { StyleSpecification } from "maplibre-gl";
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
	isApproximate: boolean;
};

const kigaliCenter: [number, number] = [30.0619, -1.9441];
const apartmentMapStyle: StyleSpecification = {
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
				"raster-saturation": -0.2,
				"raster-contrast": 0.05,
			},
		},
	],
};
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
	const exactCount = markers.filter((marker) => !marker.isApproximate).length;

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
					styles={{
						light: apartmentMapStyle,
						dark: apartmentMapStyle,
					}}
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
									data-approximate={marker.isApproximate}
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
					<small>{summaryLabel(markers.length, exactCount)}</small>
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
								{selectedMarker.isApproximate
									? "Approximate area"
									: "Exact location"}{" "}
								- {selectedMarker.city}, {selectedMarker.country}
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

		let frameId = 0;

		const fitVisibleListings = () => {
			map.resize();

			if (selectedMarker) {
				map.flyTo({
					center: [selectedMarker.longitude, selectedMarker.latitude],
					zoom: Math.max(Math.min(map.getZoom(), 13.6), 12.4),
					duration: 700,
					essential: true,
				});
				return;
			}

			if (markers.length === 1) {
				const bounds = expandBounds(getMarkerBounds(markers), markers.length);

				map.fitBounds(toMapLibreBounds(bounds), {
					padding: getFitPadding(markers.length),
					maxZoom: maxZoomForMarkerCount(markers.length),
					duration: 700,
					essential: true,
				});
				return;
			}

			if (markers.length > 1) {
				const bounds = expandBounds(getMarkerBounds(markers), markers.length);

				map.fitBounds(toMapLibreBounds(bounds), {
					padding: getFitPadding(markers.length),
					maxZoom: maxZoomForMarkerCount(markers.length),
					duration: 700,
					essential: true,
				});
			}
		};

		frameId = window.requestAnimationFrame(fitVisibleListings);

		return () => {
			window.cancelAnimationFrame(frameId);
		};
	}, [map, isLoaded, markerKey, markers, selectedMarker]);

	return null;
}

type MarkerBounds = {
	minLng: number;
	minLat: number;
	maxLng: number;
	maxLat: number;
};

function getMarkerBounds(markers: ListingMapMarker[]): MarkerBounds {
	return markers.reduce(
		(current, marker) => ({
			minLng: Math.min(current.minLng, marker.longitude),
			minLat: Math.min(current.minLat, marker.latitude),
			maxLng: Math.max(current.maxLng, marker.longitude),
			maxLat: Math.max(current.maxLat, marker.latitude),
		}),
		{
			minLng: markers[0]?.longitude ?? kigaliCenter[0],
			minLat: markers[0]?.latitude ?? kigaliCenter[1],
			maxLng: markers[0]?.longitude ?? kigaliCenter[0],
			maxLat: markers[0]?.latitude ?? kigaliCenter[1],
		},
	);
}

function expandBounds(bounds: MarkerBounds, markerCount: number): MarkerBounds {
	const lngSpan = Math.max(bounds.maxLng - bounds.minLng, 0);
	const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0);
	const minimumSpan = minimumSpanForMarkerCount(markerCount);
	const lngPadding = Math.max(lngSpan * 0.32, minimumSpan.lng);
	const latPadding = Math.max(latSpan * 0.46, minimumSpan.lat);

	return {
		minLng: bounds.minLng - lngPadding,
		minLat: bounds.minLat - latPadding,
		maxLng: bounds.maxLng + lngPadding,
		maxLat: bounds.maxLat + latPadding,
	};
}

function toMapLibreBounds(
	bounds: MarkerBounds,
): [[number, number], [number, number]] {
	return [
		[bounds.minLng, bounds.minLat],
		[bounds.maxLng, bounds.maxLat],
	];
}

function minimumSpanForMarkerCount(count: number) {
	if (count <= 1) return { lng: 0.011, lat: 0.008 };
	if (count === 2) return { lng: 0.008, lat: 0.006 };
	if (count <= 4) return { lng: 0.006, lat: 0.005 };
	if (count <= 8) return { lng: 0.004, lat: 0.004 };

	return { lng: 0.003, lat: 0.003 };
}

function getFitPadding(count: number) {
	if (count <= 1) return { top: 94, right: 98, bottom: 150, left: 98 };
	if (count === 2) return { top: 88, right: 96, bottom: 138, left: 96 };
	if (count <= 4) return { top: 82, right: 84, bottom: 128, left: 84 };

	return { top: 76, right: 72, bottom: 118, left: 72 };
}

function maxZoomForMarkerCount(count: number) {
	if (count <= 1) return 14.1;
	if (count === 2) return 13.9;
	if (count <= 4) return 13.4;
	if (count <= 8) return 12.7;

	return 12.1;
}

function toListingMarker(
	listing: PublicListing,
	detailBaseHref: string,
): ListingMapMarker | null {
	const latitude = Number(listing.location?.latitude);
	const longitude = Number(listing.location?.longitude);
	const fallbackPosition = getFallbackPosition(listing);
	const hasExactPosition = isValidCoordinatePair(longitude, latitude);

	if (!hasExactPosition && !fallbackPosition) {
		return null;
	}

	const [nextLongitude, nextLatitude] = hasExactPosition
		? [longitude, latitude]
		: fallbackPosition!;
	const price = formatMoney(listing.basePrice, listing.currency);

	return {
		id: listing.id,
		title: listing.title,
		city: listing.location?.city || listing.city,
		country: listing.location?.country || listing.country,
		priceLabel: price,
		priceMeta: `${price} / ${listing.pricingUnit.toLowerCase()}`,
		detailHref: `${detailBaseHref}/${listing.id}`,
		longitude: nextLongitude,
		latitude: nextLatitude,
		isApproximate: !hasExactPosition,
	};
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

function summaryLabel(total: number, exactCount: number) {
	if (total === 0) return "shown on map";
	if (total === exactCount) {
		return total === 1 ? "mapped apartment" : "mapped apartments";
	}

	return `${exactCount} exact · ${total - exactCount} approximate`;
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
