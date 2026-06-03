"use client";

import { MapPin } from "lucide-react";
import {
	Map,
	MapControls,
	MapMarker,
	MarkerContent,
} from "@/components/ui/map";
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
			<div className={styles.mapCanvas}>
				<Map
					className={styles.mapViewport}
					center={kigaliCenter}
					zoom={11.3}
					pitch={36}
					bearing={-8}
					theme="dark"
				>
					<MapControls
						position="top-right"
						showCompass
						showFullscreen
						className={styles.mapControls}
					/>
					{kigaliMarkers.map((marker) => (
						<MapMarker
							key={marker.label}
							longitude={marker.longitude}
							latitude={marker.latitude}
						>
							<MarkerContent className={styles.mapMarker}>
								<MapPin aria-hidden="true" />
							</MarkerContent>
						</MapMarker>
					))}
				</Map>
			</div>
		</aside>
	);
}
