"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
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
	long_name?: string;
	short_name?: string;
	types: string[];
};

type GooglePlaceResult = {
	name?: string;
	formatted_address?: string;
	geometry?: {
		location?: GoogleLatLng;
	};
	address_components?: GoogleAddressComponent[];
};

type GoogleMap = {
	setCenter: (position: { lat: number; lng: number }) => void;
	setZoom: (zoom: number) => void;
};

type GoogleMarker = {
	setPosition: (position: { lat: number; lng: number }) => void;
};

type GoogleMapsEventListener = {
	remove: () => void;
};

type GoogleAutocomplete = {
	addListener: (
		eventName: "place_changed",
		handler: () => void,
	) => GoogleMapsEventListener;
	getPlace: () => GooglePlaceResult;
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
					componentRestrictions?: {
						country: string | string[];
					};
				},
			) => GoogleAutocomplete;
		};
	};
};

type GoogleMapsWindow = Window & {
	google?: GoogleMapsGlobal;
	gm_authFailure?: () => void;
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
		if (!apiKey) return;

		let active = true;
		let placeListener: GoogleMapsEventListener | null = null;

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
						componentRestrictions: { country: "rw" },
					},
				);

				// Google writes suggestions into the input, so the listener only stores
				// the final selected place in our listing form state.
				placeListener = autocomplete.addListener("place_changed", () => {
					handlePlaceSelect({
						autocomplete,
						map,
						marker,
						onChange: onChangeRef.current,
						onError: setLoadError,
					});
				});

				mapInstanceRef.current = map;
				markerRef.current = marker;
				setIsReady(true);
			})
			.catch((reason: unknown) => {
				if (active) {
					setLoadError(formatGoogleMapsError(reason));
				}
			});

		return () => {
			active = false;
			placeListener?.remove();
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
			<label className={styles.searchField}>
				<span>Search location</span>
				<input
					ref={inputRef}
					type="search"
					defaultValue={value.address || value.name}
					placeholder="Search the listing address on Google Maps"
					autoComplete="off"
				/>
			</label>
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

function handlePlaceSelect({
	autocomplete,
	map,
	marker,
	onChange,
	onError,
}: {
	autocomplete: GoogleAutocomplete;
	map: GoogleMap;
	marker: GoogleMarker;
	onChange: (place: ListingPlaceValue) => void;
	onError: (message: string | null) => void;
}) {
	const place = autocomplete.getPlace();
	const position = normalizeLatLng(place.geometry?.location);

	if (!position) {
		onError("Select a place from the Google suggestions list.");
		return;
	}

	const nextPlace = buildPlaceValue(place, position);

	map.setCenter(position);
	map.setZoom(16);
	marker.setPosition(position);
	onError(null);
	onChange(nextPlace);
}

function formatGoogleMapsError(reason: unknown) {
	const message =
		reason instanceof Error
			? reason.message
			: typeof reason === "string"
				? reason
				: "Unknown Google Maps error.";

	return `Google Maps could not load: ${message}`;
}

function loadGoogleMaps(apiKey: string): Promise<GoogleMapsGlobal> {
	if (typeof window === "undefined") {
		return Promise.reject(
			new Error("Google Maps can load only in the browser."),
		);
	}

	const existingGoogle = getGoogleMaps();

	if (existingGoogle?.maps.places?.Autocomplete) {
		return Promise.resolve(existingGoogle);
	}

	if (googleMapsPromise) {
		return googleMapsPromise;
	}

	googleMapsPromise = new Promise<GoogleMapsGlobal>((resolve, reject) => {
		const script = document.createElement("script");
		const googleWindow = window as GoogleMapsWindow;
		const previousAuthFailure = googleWindow.gm_authFailure;
		let settled = false;
		const rejectOnce = (error: Error) => {
			if (settled) return;
			settled = true;
			reject(error);
		};

		script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
			apiKey,
		)}&libraries=places&v=weekly&loading=async`;
		script.async = true;
		script.defer = true;
		googleWindow.gm_authFailure = () => {
			previousAuthFailure?.();
			rejectOnce(
				new Error(
					"Google rejected this API key. Check billing, HTTP referrer restrictions, and that this exact localhost origin is allowed.",
				),
			);
		};
		script.onload = () => {
			const googleMaps = getGoogleMaps();

			if (googleMaps?.maps.places?.Autocomplete) {
				settled = true;
				resolve(googleMaps);
			} else {
				rejectOnce(new Error("Google Places Autocomplete was not available."));
			}
		};
		script.onerror = () =>
			rejectOnce(new Error("Google Maps JavaScript API failed to load."));
		document.head.appendChild(script);
	}).catch((error: unknown) => {
		googleMapsPromise = null;
		throw error;
	});

	return googleMapsPromise;
}

function getGoogleMaps() {
	return (window as GoogleMapsWindow).google;
}

function normalizeLatLng(location: GoogleLatLng | undefined) {
	if (!location) return null;

	const lat = location.lat();
	const lng = location.lng();

	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

	return { lat, lng };
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

	return component?.long_name ?? component?.short_name ?? "";
}
