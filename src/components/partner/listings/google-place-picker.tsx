"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import styles from "./google-place-picker.module.css";

export type ListingPlaceValue = {
	name: string;
	address: string;
	latitude: string;
	longitude: string;
	city: string;
	country: string;
};

type GooglePlacePickerProps = {
	value: ListingPlaceValue;
	error?: string;
	onChange: (place: ListingPlaceValue) => void;
};

type GoogleLatLng = {
	lat: () => number;
	lng: () => number;
};

type GoogleAddressComponent = {
	long_name: string;
	short_name: string;
	types: string[];
};

type GooglePlaceResult = {
	name?: string;
	formatted_address?: string;
	address_components?: GoogleAddressComponent[];
	geometry?: {
		location?: GoogleLatLng;
	};
};

type GoogleAutocomplete = {
	addListener: (
		eventName: "place_changed",
		callback: () => void,
	) => { remove: () => void };
	getPlace: () => GooglePlaceResult;
};

type GoogleMap = {
	setCenter: (position: { lat: number; lng: number }) => void;
	setZoom: (zoom: number) => void;
};

type GoogleMarker = {
	setPosition: (position: { lat: number; lng: number }) => void;
};

type GoogleMapsGlobal = {
	maps: {
		Map: new (
			element: HTMLElement,
			options: {
				center: { lat: number; lng: number };
				zoom: number;
				disableDefaultUI?: boolean;
				zoomControl?: boolean;
				mapTypeControl?: boolean;
				streetViewControl?: boolean;
				fullscreenControl?: boolean;
			},
		) => GoogleMap;
		Marker: new (options: {
			map: GoogleMap;
			position: { lat: number; lng: number };
		}) => GoogleMarker;
		places: {
			Autocomplete: new (
				input: HTMLInputElement,
				options: {
					fields: string[];
					types?: string[];
				},
			) => GoogleAutocomplete;
		};
	};
};

let googleMapsPromise: Promise<GoogleMapsGlobal> | null = null;

export function GooglePlacePicker({
	value,
	error,
	onChange,
}: GooglePlacePickerProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const mapRef = useRef<HTMLDivElement | null>(null);
	const mapInstanceRef = useRef<GoogleMap | null>(null);
	const markerRef = useRef<GoogleMarker | null>(null);
	const listenerRef = useRef<{ remove: () => void } | null>(null);
	const onChangeRef = useRef(onChange);
	const initialValueRef = useRef(value);
	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
	const [isReady, setIsReady] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(() =>
		apiKey
			? null
			: "Google Maps is not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY before selecting listing coordinates.",
	);

	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	useEffect(() => {
		if (!apiKey) {
			return;
		}

		let active = true;

		loadGoogleMaps(apiKey)
			.then((googleMaps) => {
				if (!active || !inputRef.current || !mapRef.current) return;

				const initialPosition = {
					lat: Number(initialValueRef.current.latitude) || -1.9441,
					lng: Number(initialValueRef.current.longitude) || 30.0619,
				};
				const map = new googleMaps.maps.Map(mapRef.current, {
					center: initialPosition,
					zoom:
						initialValueRef.current.latitude &&
						initialValueRef.current.longitude
							? 15
							: 12,
					disableDefaultUI: true,
					zoomControl: true,
					mapTypeControl: false,
					streetViewControl: false,
					fullscreenControl: false,
				});
				const marker = new googleMaps.maps.Marker({
					map,
					position: initialPosition,
				});
				const autocomplete = new googleMaps.maps.places.Autocomplete(
					inputRef.current,
					{
						fields: [
							"name",
							"formatted_address",
							"geometry",
							"address_components",
						],
					},
				);
				listenerRef.current = autocomplete.addListener("place_changed", () => {
					const place = autocomplete.getPlace();
					const location = place.geometry?.location;

					if (!location) {
						setLoadError("Select a place from the Google suggestions list.");
						return;
					}

					const nextPosition = {
						lat: location.lat(),
						lng: location.lng(),
					};
					const nextPlace = buildPlaceValue(place, nextPosition);

					map.setCenter(nextPosition);
					map.setZoom(16);
					marker.setPosition(nextPosition);
					setLoadError(null);
					onChangeRef.current(nextPlace);
				});

				mapInstanceRef.current = map;
				markerRef.current = marker;
				setIsReady(true);
			})
			.catch(() => {
				if (active) {
					setLoadError(
						"Google Maps could not load. Check the API key and Places API access.",
					);
				}
			});

		return () => {
			active = false;
			listenerRef.current?.remove();
			listenerRef.current = null;
		};
	}, [apiKey]);

	useEffect(() => {
		const latitude = Number(value.latitude);
		const longitude = Number(value.longitude);

		if (
			!Number.isFinite(latitude) ||
			!Number.isFinite(longitude) ||
			!mapInstanceRef.current ||
			!markerRef.current
		) {
			return;
		}

		const position = { lat: latitude, lng: longitude };

		mapInstanceRef.current.setCenter(position);
		mapInstanceRef.current.setZoom(16);
		markerRef.current.setPosition(position);
	}, [value.latitude, value.longitude]);

	return (
		<div className={styles.picker} data-invalid={Boolean(error)}>
			<Input
				ref={inputRef}
				defaultValue={value.address || value.name}
				placeholder="Search the listing address on Google Maps"
				icon={<Search aria-hidden="true" />}
				aria-invalid={Boolean(error)}
			/>
			<div className={styles.mapPreview} ref={mapRef}>
				{isReady ? null : (
					<div className={styles.mapFallback}>
						<MapPin aria-hidden="true" />
						<span>Loading Google map for Kigali</span>
					</div>
				)}
			</div>
			{value.latitude && value.longitude ? (
				<div className={styles.selectedPlace}>
					<MapPin aria-hidden="true" />
					<p>
						<strong>{value.name || "Selected location"}</strong>
						<span>{value.address}</span>
						<small>
							{Number(value.latitude).toFixed(6)},{" "}
							{Number(value.longitude).toFixed(6)}
						</small>
					</p>
				</div>
			) : null}
			{error || loadError ? (
				<p className={styles.inlineError}>{error ?? loadError}</p>
			) : null}
		</div>
	);
}

function loadGoogleMaps(apiKey: string): Promise<GoogleMapsGlobal> {
	if (typeof window === "undefined") {
		return Promise.reject(
			new Error("Google Maps can load only in the browser."),
		);
	}

	const existingGoogle = getGoogleMaps();

	if (existingGoogle?.maps.places) {
		return Promise.resolve(existingGoogle);
	}

	if (googleMapsPromise) {
		return googleMapsPromise;
	}

	googleMapsPromise = new Promise((resolve, reject) => {
		const script = document.createElement("script");

		script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
			apiKey,
		)}&libraries=places`;
		script.async = true;
		script.defer = true;
		script.onload = () => {
			const googleMaps = getGoogleMaps();

			if (googleMaps?.maps.places) {
				resolve(googleMaps);
			} else {
				reject(new Error("Google Places library was not available."));
			}
		};
		script.onerror = () =>
			reject(new Error("Google Maps JavaScript API failed to load."));
		document.head.appendChild(script);
	});

	return googleMapsPromise;
}

function getGoogleMaps() {
	return (window as Window & { google?: GoogleMapsGlobal }).google;
}

function buildPlaceValue(
	place: GooglePlaceResult,
	position: { lat: number; lng: number },
): ListingPlaceValue {
	return {
		name: place.name ?? "",
		address: place.formatted_address ?? place.name ?? "",
		latitude: String(position.lat),
		longitude: String(position.lng),
		city: findAddressComponent(place, [
			"locality",
			"administrative_area_level_2",
			"sublocality",
		]),
		country: findAddressComponent(place, ["country"]) || "Rwanda",
	};
}

function findAddressComponent(place: GooglePlaceResult, types: string[]) {
	const component = place.address_components?.find((item) =>
		types.some((type) => item.types.includes(type)),
	);

	return component?.long_name ?? "";
}
