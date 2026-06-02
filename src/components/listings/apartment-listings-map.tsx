"use client";

import { Building2, Home, MapPin, Navigation, Route } from "lucide-react";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import styles from "./apartment-listings-map.module.css";

const kigaliMarkers = [
	{ label: "Kimihurura", longitude: 30.0894, latitude: -1.9507 },
	{ label: "Kacyiru", longitude: 30.0706, latitude: -1.9367 },
	{ label: "Nyarutarama", longitude: 30.1037, latitude: -1.9336 },
	{ label: "Kiyovu", longitude: 30.0619, latitude: -1.9548 },
] as const;

const kigaliCenter: [number, number] = [30.0619, -1.9441];

export function ApartmentListingsMap() {
	return (
		<aside className={styles.panel} aria-label="Static Kigali apartment map">
			<div className={styles.header}>
				<span>
					<MapPin aria-hidden="true" />
				</span>
				<div>
					<p>Kigali map</p>
					<h2>Apartment coverage</h2>
				</div>
			</div>

			<div className={styles.mapCanvas}>
				<Map
					className={styles.mapViewport}
					center={kigaliCenter}
					zoom={11.3}
					pitch={36}
					bearing={-8}
					theme="light"
					interactive={false}
				>
					{kigaliMarkers.map((marker) => (
						<MapMarker
							key={marker.label}
							longitude={marker.longitude}
							latitude={marker.latitude}
						>
							<MarkerContent className={styles.mapMarker}>
								<MapPin aria-hidden="true" />
								<span className={styles.markerLabel}>{marker.label}</span>
							</MarkerContent>
						</MapMarker>
					))}
				</Map>
				<div className={styles.district} data-position="north">
					<Building2 aria-hidden="true" />
					Gasabo
				</div>
				<div className={styles.district} data-position="south">
					<Home aria-hidden="true" />
					Nyarugenge
				</div>
			</div>

			<div className={styles.footer}>
				<div>
					<Navigation aria-hidden="true" />
					<span>Default center</span>
					<strong>Kigali, Rwanda</strong>
				</div>
				<div>
					<Route aria-hidden="true" />
					<span>Mode</span>
					<strong>Static preview</strong>
				</div>
			</div>
		</aside>
	);
}
