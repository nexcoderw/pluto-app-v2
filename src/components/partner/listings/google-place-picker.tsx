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

type GoogleLatLngLike =
	| {
			lat: () => number;
			lng: () => number;
	  }
	| {
			lat: number;
			lng: number;
	  };

type ModernAddressComponent = {
	longText?: string;
	shortText?: string;
	types: string[];
};

type ModernGooglePlace = {
	displayName?: string;
	formattedAddress?: string;
	location?: GoogleLatLngLike;
	addressComponents?: ModernAddressComponent[];
	fetchFields: (options: { fields: string[] }) => Promise<void>;
};

type PlacePrediction = {
	toPlace: () => ModernGooglePlace;
};

type PlaceSelectEvent = Event & {
	placePrediction?: PlacePrediction;
};

type PlaceAutocompleteElement = HTMLElement & {
	placeholder?: string;
	value?: string;
	includedRegionCodes?: string[];
};

type GoogleMap = {
	setCenter: (position: { lat: number; lng: number }) => void;
	setZoom: (zoom: number) => void;
};

type GoogleAdvancedMarker = {
	position?: { lat: number; lng: number };
};

type GoogleMapsGlobal = {
	maps: {
		importLibrary: (library: string) => Promise<Record<string, unknown>>;
	};
};

type GoogleMapsWindow = Window & {
	google?: GoogleMapsGlobal;
	gm_authFailure?: () => void;
};

type GoogleMapsLibraries = {
	Map: new (
		element: HTMLElement,
		options: GoogleMapOptions,
	) => GoogleMap;
	AdvancedMarkerElement: new (options: {
		map: GoogleMap;
		position: { lat: number; lng: number };
	}) => GoogleAdvancedMarker;
	PlaceAutocompleteElement: new () => PlaceAutocompleteElement;
};

type GoogleMapOptions = {
			center: { lat: number; lng: number };
			zoom: number;
			mapId?: string;
			disableDefaultUI?: boolean;
			zoomControl?: boolean;
			mapTypeControl?: boolean;
			streetViewControl?: boolean;
			fullscreenControl?: boolean;
};

let googleMapsPromise: Promise<GoogleMapsGlobal> | null = null;
let googleLibrariesPromise: Promise<GoogleMapsLibraries> | null = null;

export function GooglePlacePicker({
	value,
	error,
	onChange,
}: GooglePlacePickerProps) {
	const autocompleteHostRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<HTMLDivElement | null>(null);
	const mapInstanceRef = useRef<GoogleMap | null>(null);
	const markerRef = useRef<GoogleAdvancedMarker | null>(null);
	const autocompleteRef = useRef<PlaceAutocompleteElement | null>(null);
	const onChangeRef = useRef(onChange);
	const initialValueRef = useRef(value);
	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
	const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim();
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
		let removeSelectListener: (() => void) | null = null;
		let appendedHost: HTMLDivElement | null = null;

		loadGoogleLibraries(apiKey)
			.then(({ Map, AdvancedMarkerElement, PlaceAutocompleteElement }) => {
				if (
					!active ||
					!autocompleteHostRef.current ||
					!mapRef.current ||
					autocompleteRef.current
				) {
					return;
				}
				const autocompleteHost = autocompleteHostRef.current;
				const mapElement = mapRef.current;

				if (!autocompleteHost || !mapElement) return;

				const initialPosition = {
					lat: Number(initialValueRef.current.latitude) || -1.9441,
					lng: Number(initialValueRef.current.longitude) || 30.0619,
				};
				const baseMapOptions: GoogleMapOptions = {
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
				};
				const { map, marker } = createMapWithMarker({
					Map,
					AdvancedMarkerElement,
					element: mapElement,
					options: baseMapOptions,
					position: initialPosition,
					mapId,
				});
				const autocomplete = new PlaceAutocompleteElement();

				autocomplete.placeholder = "Search the listing address on Google Maps";
				autocomplete.includedRegionCodes = ["rw"];
				if (initialValueRef.current.address || initialValueRef.current.name) {
					autocomplete.value =
						initialValueRef.current.address || initialValueRef.current.name;
				}

				const handleSelect = (event: Event) => {
					void handlePlaceSelect({
						event: event as PlaceSelectEvent,
						map,
						marker,
						onChange: onChangeRef.current,
						onError: setLoadError,
					});
				};

				autocomplete.addEventListener("gmp-select", handleSelect);
				removeSelectListener = () =>
					autocomplete.removeEventListener("gmp-select", handleSelect);
				autocompleteHost.appendChild(autocomplete);
				appendedHost = autocompleteHost;

				autocompleteRef.current = autocomplete;
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
			removeSelectListener?.();
			const autocomplete = autocompleteRef.current;

			if (appendedHost && autocomplete && appendedHost.contains(autocomplete)) {
				appendedHost.removeChild(autocomplete);
			}
			autocompleteRef.current = null;
		};
	}, [apiKey, mapId]);

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
		markerRef.current.position = position;
	}, [value.latitude, value.longitude]);

	return (
		<div className={styles.picker} data-invalid={Boolean(error)}>
			<div
				ref={autocompleteHostRef}
				className={styles.autocompleteHost}
				aria-label="Google place search"
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

function createMapWithMarker({
	Map,
	AdvancedMarkerElement,
	element,
	options,
	position,
	mapId,
}: {
	Map: GoogleMapsLibraries["Map"];
	AdvancedMarkerElement: GoogleMapsLibraries["AdvancedMarkerElement"];
	element: HTMLElement;
	options: GoogleMapOptions;
	position: { lat: number; lng: number };
	mapId?: string;
}) {
	const candidateMapIds = Array.from(
		new Set([mapId, "DEMO_MAP_ID"].filter(Boolean)),
	) as string[];
	let lastError: unknown = null;

	for (const candidateMapId of candidateMapIds) {
		try {
			const map = new Map(element, {
				...options,
				mapId: candidateMapId,
			});
			const marker = new AdvancedMarkerElement({
				map,
				position,
			});

			return { map, marker };
		} catch (error) {
			lastError = error;
		}
	}

	throw lastError ?? new Error("Google Maps could not initialize a map ID.");
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

async function handlePlaceSelect({
	event,
	map,
	marker,
	onChange,
	onError,
}: {
	event: PlaceSelectEvent;
	map: GoogleMap;
	marker: GoogleAdvancedMarker;
	onChange: (place: ListingPlaceValue) => void;
	onError: (message: string | null) => void;
}) {
	const place = event.placePrediction?.toPlace();

	if (!place) {
		onError("Select a place from the Google suggestions list.");
		return;
	}

	await place.fetchFields({
		fields: [
			"displayName",
			"formattedAddress",
			"location",
			"addressComponents",
		],
	});

	const nextPosition = normalizeLatLng(place.location);

	if (!nextPosition) {
		onError("Select a place with a valid Google Maps location.");
		return;
	}

	const nextPlace = buildPlaceValue(place, nextPosition);

	map.setCenter(nextPosition);
	map.setZoom(16);
	marker.position = nextPosition;
	onError(null);
	onChange(nextPlace);
}

async function loadGoogleLibraries(
	apiKey: string,
): Promise<GoogleMapsLibraries> {
	if (googleLibrariesPromise) return googleLibrariesPromise;

	googleLibrariesPromise = loadGoogleMaps(apiKey).then(async (googleMaps) => {
		const [mapsLibrary, markerLibrary, placesLibrary] = await Promise.all([
			googleMaps.maps.importLibrary("maps"),
			googleMaps.maps.importLibrary("marker"),
			googleMaps.maps.importLibrary("places"),
		]);

		return {
			Map: mapsLibrary.Map as GoogleMapsLibraries["Map"],
			AdvancedMarkerElement:
				markerLibrary.AdvancedMarkerElement as GoogleMapsLibraries["AdvancedMarkerElement"],
			PlaceAutocompleteElement:
				placesLibrary.PlaceAutocompleteElement as GoogleMapsLibraries["PlaceAutocompleteElement"],
		};
	});

	return googleLibrariesPromise;
}

function loadGoogleMaps(apiKey: string): Promise<GoogleMapsGlobal> {
	if (typeof window === "undefined") {
		return Promise.reject(
			new Error("Google Maps can load only in the browser."),
		);
	}

	const existingGoogle = getGoogleMaps();

	if (existingGoogle?.maps.importLibrary) {
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
		)}&v=weekly&loading=async`;
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

			if (googleMaps?.maps.importLibrary) {
				settled = true;
				resolve(googleMaps);
			} else {
				rejectOnce(
					new Error("Google Maps importLibrary was not available."),
				);
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

function normalizeLatLng(location: GoogleLatLngLike | undefined) {
	if (!location) return null;

	const lat =
		typeof location.lat === "function" ? location.lat() : location.lat;
	const lng =
		typeof location.lng === "function" ? location.lng() : location.lng;

	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

	return { lat, lng };
}

function buildPlaceValue(
	place: ModernGooglePlace,
	position: { lat: number; lng: number },
): ListingPlaceValue {
	return {
		name: place.displayName ?? "",
		address: place.formattedAddress ?? place.displayName ?? "",
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

function findAddressComponent(place: ModernGooglePlace, types: string[]) {
	const component = place.addressComponents?.find((item) =>
		types.some((type) => item.types.includes(type)),
	);

	return component?.longText ?? component?.shortText ?? "";
}
