"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MapPin, Navigation, Search } from "lucide-react";
import {
	Map,
	MapControls,
	MapMarker,
	MarkerContent,
	type MapViewport,
} from "@/components/ui/map";
import { getPlaceDetails, searchPlaces } from "@/services/api/places";
import type { PlacePrediction } from "@/services/api/places";
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

const KIGALI_CENTER: [number, number] = [30.0619, -1.9441];

export function GooglePlacePicker({
	value,
	error,
	onChange,
}: GooglePlacePickerProps) {
	const selectedPosition = useMemo(() => getSelectedPosition(value), [value]);
	const [query, setQuery] = useState(value.address || value.name);
	const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [isResolving, setIsResolving] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [viewport, setViewport] = useState<Partial<MapViewport>>({
		center: selectedPosition ?? KIGALI_CENTER,
		zoom: selectedPosition ? 15 : 12,
		pitch: 26,
		bearing: -8,
	});
	const latestQueryRef = useRef(query);

	useEffect(() => {
		latestQueryRef.current = query;
	}, [query]);

	useEffect(() => {
		const trimmedQuery = query.trim();

		if (trimmedQuery.length < 2) {
			return;
		}

		let active = true;
		const timeout = window.setTimeout(() => {
			setIsSearching(true);
			searchPlaces(trimmedQuery)
				.then((response) => {
					if (!active || latestQueryRef.current.trim() !== trimmedQuery) return;

					setPredictions(
						response.predictions.filter((prediction) => prediction.placeId),
					);
					setLoadError(null);
				})
				.catch((reason: unknown) => {
					if (!active) return;

					setPredictions([]);
					setLoadError(formatPlaceError(reason));
				})
				.finally(() => {
					if (active) setIsSearching(false);
				});
		}, 320);

		return () => {
			active = false;
			window.clearTimeout(timeout);
		};
	}, [query]);

	const handleSelectPlace = async (prediction: PlacePrediction) => {
		setIsResolving(true);
		setLoadError(null);

		try {
			const response = await getPlaceDetails(prediction.placeId);
			const nextPosition: [number, number] = [
				Number(response.place.longitude),
				Number(response.place.latitude),
			];

			if (!isValidPosition(nextPosition)) {
				setLoadError("Selected place does not include valid coordinates.");
				return;
			}

			setQuery(response.place.address || response.place.name);
			setPredictions([]);
			setViewport((current) => ({
				...current,
				center: nextPosition,
				zoom: 15.5,
			}));
			onChange(response.place);
		} catch (reason) {
			setLoadError(formatPlaceError(reason));
		} finally {
			setIsResolving(false);
		}
	};

	const handleQueryChange = (nextQuery: string) => {
		setQuery(nextQuery);

		if (nextQuery.trim().length < 2) {
			setPredictions([]);
			setIsSearching(false);
			setLoadError(null);
		}
	};

	return (
		<div className={styles.picker} data-invalid={Boolean(error)}>
			<div className={styles.searchField}>
				<label htmlFor="listing-location-search">Search location</label>
				<div className={styles.searchInputWrap}>
					<Search aria-hidden="true" />
					<input
						id="listing-location-search"
						type="search"
						value={query}
						placeholder="Search the listing address in Rwanda"
						autoComplete="off"
						onChange={(event) => handleQueryChange(event.target.value)}
					/>
					{isSearching || isResolving ? (
						<Loader2 className={styles.loadingIcon} aria-hidden="true" />
					) : null}
				</div>
				{predictions.length > 0 ? (
					<div className={styles.suggestions} role="listbox">
						{predictions.map((prediction) => (
							<button
								key={prediction.placeId}
								type="button"
								onClick={() => void handleSelectPlace(prediction)}
								disabled={isResolving}
							>
								<MapPin aria-hidden="true" />
								<span>
									<strong>{prediction.mainText}</strong>
									<small>
										{prediction.secondaryText || prediction.description}
									</small>
								</span>
							</button>
						))}
					</div>
				) : null}
			</div>

			<div className={styles.mapPreview}>
				<Map
					className={styles.mapViewport}
					center={KIGALI_CENTER}
					zoom={12}
					theme="dark"
					viewport={viewport}
					onViewportChange={setViewport}
				>
					<MapControls
						position="top-right"
						showCompass
						showFullscreen
						className={styles.mapControls}
					/>
					<MapMarker
						longitude={(selectedPosition ?? KIGALI_CENTER)[0]}
						latitude={(selectedPosition ?? KIGALI_CENTER)[1]}
					>
						<MarkerContent className={styles.mapMarker}>
							<Navigation aria-hidden="true" />
						</MarkerContent>
					</MapMarker>
				</Map>
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

function getSelectedPosition(value: ListingPlaceValue) {
	const latitude = Number(value.latitude);
	const longitude = Number(value.longitude);
	const position: [number, number] = [longitude, latitude];

	return isValidPosition(position) ? position : null;
}

function isValidPosition(position: [number, number]) {
	const [longitude, latitude] = position;

	return (
		Number.isFinite(latitude) &&
		Number.isFinite(longitude) &&
		latitude >= -90 &&
		latitude <= 90 &&
		longitude >= -180 &&
		longitude <= 180
	);
}

function formatPlaceError(reason: unknown) {
	if (reason instanceof Error) return reason.message;
	if (typeof reason === "string") return reason;

	return "Location search could not be completed.";
}
