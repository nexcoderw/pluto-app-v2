"use client";

import {
	BedDouble,
	CircleDollarSign,
	House,
	MapPin,
	RefreshCcw,
	Search,
	SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useListingOptions } from "@/hooks/use-listing-options";
import { useCurrency } from "@/providers/currency-provider";
import type { ListingListRequest } from "@/services/api/listings";
import { normalizeAirbnbPropertyType } from "@/services/api/listing-options";
import type { ListingSidebarRenderProps } from "../category-listings-page";
import { ListingPopularAmenityFilter } from "../listing-popular-amenity-filter";
import styles from "./airbnb-listings-sidebar.module.css";

const countries = ["Rwanda", "Kenya", "Uganda", "Tanzania", "Burundi"];
const maxBudget = 1200000;
const budgetStep = 10000;

export function AirbnbListingsSidebar({
	categoryLabel,
	draftFilters,
	setDraftFilter,
	applyFilters,
	resetFilters,
	variant = "sidebar",
}: ListingSidebarRenderProps & {
	variant?: "sidebar" | "dialog";
}) {
	const { formatMoney, isRateReady } = useCurrency();
	const { options: listingOptions } = useListingOptions();
	const selectedBudget =
		typeof draftFilters.maxPrice === "number"
			? draftFilters.maxPrice
			: maxBudget;
	const hasBudgetFilter = typeof draftFilters.maxPrice === "number";

	return (
		<aside
			className={styles.sidebar}
			data-variant={variant}
			aria-label={`${categoryLabel} filters`}
		>
			<div className={styles.header}>
				<span className={styles.iconBadge}>
					<House aria-hidden="true" />
				</span>
				<div>
					<p>Airbnb filters</p>
					<h2>Find the right home</h2>
				</div>
			</div>

			<div className={styles.section}>
				<div className={styles.sectionTitle}>
					<MapPin aria-hidden="true" />
					<span>Location</span>
				</div>
				<div className={styles.locationGrid}>
					<Input
						type="text"
						value={textValue(draftFilters.city)}
						placeholder="City"
						onChange={(event) => setDraftFilter("city", event.target.value)}
					/>
					<Select
						value={selectValue(draftFilters.country)}
						onValueChange={(value) =>
							setDraftFilter("country", optionalText(value))
						}
					>
						<SelectTrigger className={styles.selectTrigger}>
							<SelectValue>Country</SelectValue>
						</SelectTrigger>
						<SelectContent align="start" alignItemWithTrigger={false}>
							<SelectItem value="ANY">Any country</SelectItem>
							{countries.map((country) => (
								<SelectItem key={country} value={country}>
									{country}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className={styles.section}>
				<div className={styles.sectionTitle}>
					<Search aria-hidden="true" />
					<span>Home type</span>
				</div>
				<div className={styles.homeTypeGrid}>
					<Select
						value={selectValue(draftFilters.propertyType)}
						onValueChange={(value) =>
							setDraftFilter(
								"propertyType",
								!value || value === "ANY"
									? undefined
									: normalizeAirbnbPropertyType(value),
							)
						}
					>
						<SelectTrigger className={styles.selectTrigger}>
							<SelectValue>Property type</SelectValue>
						</SelectTrigger>
						<SelectContent align="start" alignItemWithTrigger={false}>
							<SelectItem value="ANY">Any property type</SelectItem>
							{listingOptions.airbnb.propertyTypes.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className={styles.section}>
				<ListingPopularAmenityFilter
					category="AIRBNB_HOUSE"
					amenities={listingOptions.amenities}
					value={textValue(draftFilters.amenities)}
					onChange={(value) => setDraftFilter("amenities", value)}
				/>
			</div>

			<div className={styles.section}>
				<div className={styles.sectionTitle}>
					<BedDouble aria-hidden="true" />
					<span>Space</span>
				</div>
				<div className={styles.spaceGrid}>
					<Select
						value={selectValue(draftFilters.bedrooms)}
						onValueChange={(value) =>
							setDraftFilter("bedrooms", optionalNumber(value))
						}
					>
						<SelectTrigger className={styles.selectTrigger}>
							<SelectValue>Bedrooms</SelectValue>
						</SelectTrigger>
						<SelectContent align="start" alignItemWithTrigger={false}>
							<SelectItem value="ANY">Any beds</SelectItem>
							{listingOptions.numbers.bedrooms.map((option) => (
								<SelectItem key={option.value} value={String(option.value)}>
									{option.label} beds
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={selectValue(draftFilters.bathrooms)}
						onValueChange={(value) =>
							setDraftFilter("bathrooms", optionalNumber(value))
						}
					>
						<SelectTrigger className={styles.selectTrigger}>
							<SelectValue>Bathrooms</SelectValue>
						</SelectTrigger>
						<SelectContent align="start" alignItemWithTrigger={false}>
							<SelectItem value="ANY">Any baths</SelectItem>
							{listingOptions.numbers.bathrooms.map((option) => (
								<SelectItem key={option.value} value={String(option.value)}>
									{option.label} baths
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={selectValue(draftFilters.guests)}
						onValueChange={(value) =>
							setDraftFilter("guests", optionalNumber(value))
						}
					>
						<SelectTrigger className={styles.selectTrigger}>
							<SelectValue>Guests</SelectValue>
						</SelectTrigger>
						<SelectContent align="start" alignItemWithTrigger={false}>
							<SelectItem value="ANY">Any guests</SelectItem>
							{listingOptions.numbers.guests.map((option) => (
								<SelectItem key={option.value} value={String(option.value)}>
									{option.label} guests
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className={styles.section}>
				<div className={styles.sectionTitle}>
					<CircleDollarSign aria-hidden="true" />
					<span>Price</span>
				</div>
				<div className={styles.priceCard}>
					<div className={styles.priceHeader}>
						<span>Max budget</span>
						<strong>
							{hasBudgetFilter
								? formatMoney(selectedBudget, "RWF")
								: "Any budget"}
						</strong>
					</div>
					<input
						type="range"
						min={budgetStep}
						max={maxBudget}
						step={budgetStep}
						value={selectedBudget}
						className={styles.range}
						onChange={(event) =>
							setDraftFilter("maxPrice", Number(event.target.value))
						}
						aria-label="Maximum Airbnb listing price"
					/>
					<p className={styles.budgetHint}>
						{isRateReady
							? "Shown in your selected currency. The server applies the active rate to USD and RWF listings."
							: "The exchange rate is temporarily unavailable; the budget remains safely shown in RWF."}
					</p>
					<button
						type="button"
						className={styles.clearBudget}
						onClick={() => setDraftFilter("maxPrice", undefined)}
					>
						Clear budget
					</button>
				</div>
			</div>

			<div className={styles.actions}>
				<Button type="button" onClick={applyFilters}>
					<SlidersHorizontal aria-hidden="true" />
					Apply filters
				</Button>
				<Button type="button" variant="outline" onClick={resetFilters}>
					<RefreshCcw aria-hidden="true" />
					Reset
				</Button>
			</div>
		</aside>
	);
}

function textValue(value: ListingListRequest[keyof ListingListRequest]) {
	return typeof value === "string" ? value : "";
}

function selectValue(value: ListingListRequest[keyof ListingListRequest]) {
	return value === undefined ? "ANY" : String(value);
}

function optionalText(value: string | null) {
	return !value || value === "ANY" ? undefined : value;
}

function optionalNumber(value: string | null) {
	if (!value || value === "ANY") {
		return undefined;
	}

	const numberValue = Number(value);
	return Number.isFinite(numberValue) ? numberValue : undefined;
}
