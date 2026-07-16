"use client";

import {
	CarFront,
	CircleDollarSign,
	Fuel,
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
import {
	normalizeCarFuelType,
	normalizeCarTransmission,
} from "@/services/api/listing-options";
import type { ListingSidebarRenderProps } from "../category-listings-page";
import { ListingPopularAmenityFilter } from "../listing-popular-amenity-filter";
import styles from "./car-listings-sidebar.module.css";

const countries = ["Rwanda", "Kenya", "Uganda", "Tanzania", "Burundi"];
const maxBudget = 500000;
const budgetStep = 5000;

export function CarListingsSidebar({
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
					<CarFront aria-hidden="true" />
				</span>
				<div>
					<p>Car filters</p>
					<h2>Refine your drive</h2>
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
					<span>Vehicle identity</span>
				</div>
				<div className={styles.identityGrid}>
					<Input
						type="text"
						value={textValue(draftFilters.make)}
						placeholder="Make, e.g. Toyota"
						onChange={(event) => setDraftFilter("make", event.target.value)}
					/>
					<Input
						type="text"
						value={textValue(draftFilters.model)}
						placeholder="Model, e.g. RAV4"
						onChange={(event) => setDraftFilter("model", event.target.value)}
					/>
				</div>
			</div>

			<div className={styles.section}>
				<div className={styles.sectionTitle}>
					<Fuel aria-hidden="true" />
					<span>Specifications</span>
				</div>
				<div className={styles.specGrid}>
					<Select
						value={selectValue(draftFilters.transmission)}
						onValueChange={(value) =>
							setDraftFilter(
								"transmission",
								!value || value === "ANY"
									? undefined
									: normalizeCarTransmission(value),
							)
						}
					>
						<SelectTrigger className={styles.selectTrigger}>
							<SelectValue>Transmission</SelectValue>
						</SelectTrigger>
						<SelectContent align="start" alignItemWithTrigger={false}>
							<SelectItem value="ANY">Any transmission</SelectItem>
							{listingOptions.cars.transmissions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={selectValue(draftFilters.fuelType)}
						onValueChange={(value) =>
							setDraftFilter(
								"fuelType",
								!value || value === "ANY"
									? undefined
									: normalizeCarFuelType(value),
							)
						}
					>
						<SelectTrigger className={styles.selectTrigger}>
							<SelectValue>Fuel type</SelectValue>
						</SelectTrigger>
						<SelectContent align="start" alignItemWithTrigger={false}>
							<SelectItem value="ANY">Any fuel type</SelectItem>
							{listingOptions.cars.fuelTypes.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={selectValue(draftFilters.seats)}
						onValueChange={(value) =>
							setDraftFilter("seats", optionalNumber(value))
						}
					>
						<SelectTrigger className={styles.selectTrigger}>
							<SelectValue>Seats</SelectValue>
						</SelectTrigger>
						<SelectContent align="start" alignItemWithTrigger={false}>
							<SelectItem value="ANY">Any seats</SelectItem>
							{listingOptions.cars.seats.map((option) => (
								<SelectItem key={option.value} value={String(option.value)}>
									{option.label} seats
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={selectValue(draftFilters.minYear)}
						onValueChange={(value) =>
							setDraftFilter("minYear", optionalNumber(value))
						}
					>
						<SelectTrigger className={styles.selectTrigger}>
							<SelectValue>Year</SelectValue>
						</SelectTrigger>
						<SelectContent align="start" alignItemWithTrigger={false}>
							<SelectItem value="ANY">Any year</SelectItem>
							{listingOptions.years.map((year) => (
								<SelectItem key={year} value={String(year)}>
									{year}+
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className={styles.section}>
				<ListingPopularAmenityFilter
					category="CAR"
					amenities={listingOptions.amenities}
					value={textValue(draftFilters.amenities)}
					onChange={(value) => setDraftFilter("amenities", value)}
				/>
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
						aria-label="Maximum car listing price"
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
