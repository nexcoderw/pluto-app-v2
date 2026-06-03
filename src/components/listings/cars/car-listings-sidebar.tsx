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
import type { ListingListRequest } from "@/services/api/listings";
import type { ListingSidebarRenderProps } from "../category-listings-page";
import styles from "./car-listings-sidebar.module.css";

const countries = ["Rwanda", "Kenya", "Uganda", "Tanzania", "Burundi"];
const transmissions = ["Automatic", "Manual"];
const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric"];
const seatOptions = [2, 4, 5, 7, 8];
const minYearOptions = [2024, 2022, 2020, 2018, 2015, 2010];
const maxBudget = 500000;
const budgetStep = 5000;
const usdToRwfSellRate = 1460;
const rwfToUsdBuyRate = 1470;

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
							setDraftFilter("transmission", optionalText(value))
						}
					>
						<SelectTrigger className={styles.selectTrigger}>
							<SelectValue>Transmission</SelectValue>
						</SelectTrigger>
						<SelectContent align="start" alignItemWithTrigger={false}>
							<SelectItem value="ANY">Any transmission</SelectItem>
							{transmissions.map((transmission) => (
								<SelectItem key={transmission} value={transmission}>
									{transmission}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={selectValue(draftFilters.fuelType)}
						onValueChange={(value) =>
							setDraftFilter("fuelType", optionalText(value))
						}
					>
						<SelectTrigger className={styles.selectTrigger}>
							<SelectValue>Fuel type</SelectValue>
						</SelectTrigger>
						<SelectContent align="start" alignItemWithTrigger={false}>
							<SelectItem value="ANY">Any fuel type</SelectItem>
							{fuelTypes.map((fuelType) => (
								<SelectItem key={fuelType} value={fuelType}>
									{fuelType}
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
							{seatOptions.map((seats) => (
								<SelectItem key={seats} value={String(seats)}>
									{seats}+ seats
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
							{minYearOptions.map((year) => (
								<SelectItem key={year} value={String(year)}>
									{year}+
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
							{formatBudgetLabel(selectedBudget, hasBudgetFilter)}
						</strong>
					</div>
					<div className={styles.exchangePanel}>
						<span>
							<small>USD sell</small>
							<strong>$1 = RWF {formatPlainNumber(usdToRwfSellRate)}</strong>
						</span>
						<span>
							<small>RWF buy</small>
							<strong>RWF {formatPlainNumber(rwfToUsdBuyRate)} = $1</strong>
						</span>
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
						{hasBudgetFilter
							? `Budget equivalent: ${formatUsdEquivalent(selectedBudget)} using the RWF buy rate. USD listings are filtered with the USD sell rate.`
							: "Set a RWF budget to filter both RWF and USD car listings fairly."}
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

function formatBudgetLabel(value: number, hasBudgetFilter: boolean) {
	if (!hasBudgetFilter) {
		return "Any budget";
	}

	return `RWF ${formatPlainNumber(value)}`;
}

function formatUsdEquivalent(value: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(value / rwfToUsdBuyRate);
}

function formatPlainNumber(value: number) {
	return new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 0,
	}).format(value);
}
