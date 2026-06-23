"use client";

import { useRouter } from "next/navigation";
import { addDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
	ArrowRight,
	BedDouble,
	Building2,
	CalendarDays,
	CarFront,
	CircleDollarSign,
	Filter,
	Hotel,
	Plane,
	Search,
	Users,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useListingOptions } from "@/hooks/use-listing-options";
import type {
	ListingOption,
	NumericListingOption,
} from "@/services/api/listing-options";
import styles from "./home-search.module.css";

type HomeSearchCategory =
	| "cars"
	| "apartments"
	| "hotel-rooms"
	| "airbnb"
	| "flight";

type SearchCategory = {
	id: HomeSearchCategory;
	label: string;
	shortLabel: string;
	route: string;
	placeholder: string;
	comingSoon?: boolean;
	icon: typeof CarFront;
	maxBudget: number;
};

type HomeSearchFilters = {
	transmission: string;
	fuelType: string;
	seats: string;
	minYear: string;
	bedrooms: string;
	bathrooms: string;
	roomType: string;
	bedType: string;
	propertyType: string;
	maxPrice: string;
};

type SearchSelectOption = {
	value: string;
	label: string;
};

const today = new Date();
const defaultDateRange: DateRange = {
	from: today,
	to: addDays(today, 3),
};

const usdToRwfSellRate = 1460;
const rwfToUsdBuyRate = 1470;
const budgetStep = 5000;

const searchCategories: SearchCategory[] = [
	{
		id: "cars",
		label: "Car rent",
		shortLabel: "Cars",
		route: "/listings/cars",
		placeholder: "Search car name, model, city, or partner",
		icon: CarFront,
		maxBudget: 500000,
	},
	{
		id: "apartments",
		label: "Apartment",
		shortLabel: "Apartments",
		route: "/listings/apartments",
		placeholder: "Search location, address, city, or country",
		icon: Building2,
		maxBudget: 2000000,
	},
	{
		id: "hotel-rooms",
		label: "Hotel",
		shortLabel: "Hotels",
		route: "/listings/hotel-rooms",
		placeholder: "Search location, address, city, or country",
		icon: Hotel,
		maxBudget: 1200000,
	},
	{
		id: "airbnb",
		label: "Airbnb",
		shortLabel: "AirBnB",
		route: "/listings/airbnb",
		placeholder: "Search location, address, city, or country",
		icon: BedDouble,
		maxBudget: 1500000,
	},
	{
		id: "flight",
		label: "Flight",
		shortLabel: "Flights",
		route: "/flights",
		placeholder: "Start a managed flight request",
		icon: Plane,
		maxBudget: 0,
	},
];

const defaultSearchFilters: HomeSearchFilters = {
	transmission: "",
	fuelType: "",
	seats: "",
	minYear: "",
	bedrooms: "",
	bathrooms: "",
	roomType: "",
	bedType: "",
	propertyType: "",
	maxPrice: "",
};

export function HomeSearch() {
	const router = useRouter();
	const { options: listingOptions } = useListingOptions();
	const [activeCategory, setActiveCategory] =
		useState<HomeSearchCategory>("cars");
	const [search, setSearch] = useState("");
	const [guests, setGuests] = useState(1);
	const [filters, setFilters] =
		useState<HomeSearchFilters>(defaultSearchFilters);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(
		defaultDateRange,
	);
	const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
	const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
	const activeSearchCategory = useMemo(
		() =>
			searchCategories.find((category) => category.id === activeCategory) ??
			searchCategories[0],
		[activeCategory],
	);
	const selectedBudget = filters.maxPrice
		? Number(filters.maxPrice)
		: activeSearchCategory.maxBudget;
	const hasBudgetFilter = Boolean(filters.maxPrice);
	const activeFilterCount = countActiveFilters(filters);
	const optionSets = useMemo(
		() => createOptionSets(listingOptions),
		[listingOptions],
	);

	function selectCategory(category: SearchCategory) {
		if (category.comingSoon) {
			return;
		}

		setActiveCategory(category.id);
		setGuests(1);
		setFilters(defaultSearchFilters);
	}

	function updateFilter<Key extends keyof HomeSearchFilters>(
		key: Key,
		value: HomeSearchFilters[Key],
	) {
		setFilters((current) => ({ ...current, [key]: value }));
	}

	function submitSearch(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const params = new URLSearchParams();
		const cleanSearch = search.trim();

		if (cleanSearch) {
			params.set("search", cleanSearch);
		}

		if (dateRange?.from) {
			params.set("from", format(dateRange.from, "yyyy-MM-dd"));
		}

		if (dateRange?.to) {
			params.set("to", format(dateRange.to, "yyyy-MM-dd"));
		}

		if (guests > 1 && activeCategory !== "cars") {
			params.set("guests", String(guests));
		}

		appendCategoryFilters(params, activeCategory, filters);

		const queryString = params.toString();
		router.push(
			`${activeSearchCategory.route}${queryString ? `?${queryString}` : ""}`,
		);
	}

	return (
		<>
			<form
				className={styles.searchPanel}
				data-category={activeCategory}
				onSubmit={submitSearch}
			>
				<div className={styles.categoryTabs} aria-label="Search category">
					{searchCategories.map((category) => {
						const Icon = category.icon;

						return (
							<button
								key={category.id}
								type="button"
								className={styles.categoryTab}
								data-active={activeCategory === category.id}
								data-coming-soon={category.comingSoon ? "true" : "false"}
								disabled={category.comingSoon}
								aria-disabled={category.comingSoon}
								onClick={() => selectCategory(category)}
							>
								<Icon aria-hidden="true" />
								<span>{category.label}</span>
								{category.comingSoon ? <small>Coming soon</small> : null}
							</button>
						);
					})}
				</div>

				<div className={styles.primaryFields} data-category={activeCategory}>
					<label className={styles.searchField}>
						<span>
							{activeCategory === "cars"
								? "Search"
								: activeCategory === "flight"
									? "Route"
									: "Location or address"}
						</span>
						<strong>{activeSearchCategory.shortLabel}</strong>
						<input
							type="search"
							value={search}
							placeholder={activeSearchCategory.placeholder}
							onChange={(event) => setSearch(event.target.value)}
						/>
					</label>

					<button
						type="button"
						className={styles.dateField}
						onClick={() => setIsDateDialogOpen(true)}
					>
						<CalendarDays aria-hidden="true" />
						<span>Dates</span>
						<strong>{formatDateRange(dateRange)}</strong>
					</button>

					{activeCategory !== "cars" ? (
						<label className={styles.guestField}>
							<Users aria-hidden="true" />
							<span>Guests</span>
							<select
								value={guests}
								onChange={(event) => setGuests(Number(event.target.value))}
							>
								{[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
									<option key={value} value={value}>
										{value} {value === 1 ? "guest" : "guests"}
									</option>
								))}
							</select>
						</label>
					) : null}

					<div className={styles.searchActions}>
						<Button
							type="button"
							variant="outline"
							className={styles.filterButton}
							onClick={() => setIsFilterDialogOpen(true)}
						>
							<Filter aria-hidden="true" />
							<span>Filters</span>
							{activeFilterCount > 0 ? (
								<small>{activeFilterCount}</small>
							) : null}
						</Button>
						<Button type="submit" className={styles.searchButton}>
							<Search aria-hidden="true" />
							<span>Search {activeSearchCategory.shortLabel}</span>
							<ArrowRight aria-hidden="true" />
						</Button>
					</div>
				</div>
			</form>

			<DateRangeDialog
				open={isDateDialogOpen}
				dateRange={dateRange}
				onOpenChange={setIsDateDialogOpen}
				onDateRangeChange={setDateRange}
			/>
			<SearchFilterDialog
				open={isFilterDialogOpen}
				category={activeSearchCategory}
				activeCategory={activeCategory}
				filters={filters}
				options={optionSets}
				selectedBudget={selectedBudget}
				hasBudgetFilter={hasBudgetFilter}
				onOpenChange={setIsFilterDialogOpen}
				onFilterChange={updateFilter}
				onBudgetChange={(value) => updateFilter("maxPrice", String(value))}
				onClearBudget={() => updateFilter("maxPrice", "")}
				onReset={() => setFilters(defaultSearchFilters)}
			/>
		</>
	);
}

function SearchFilterDialog({
	open,
	category,
	activeCategory,
	filters,
	options,
	selectedBudget,
	hasBudgetFilter,
	onOpenChange,
	onFilterChange,
	onBudgetChange,
	onClearBudget,
	onReset,
}: {
	open: boolean;
	category: SearchCategory;
	activeCategory: HomeSearchCategory;
	filters: HomeSearchFilters;
	options: ReturnType<typeof createOptionSets>;
	selectedBudget: number;
	hasBudgetFilter: boolean;
	onOpenChange: (open: boolean) => void;
	onFilterChange: <Key extends keyof HomeSearchFilters>(
		key: Key,
		value: HomeSearchFilters[Key],
	) => void;
	onBudgetChange: (value: number) => void;
	onClearBudget: () => void;
	onReset: () => void;
}) {
	const Icon = category.icon;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={styles.filterDialog}
				data-category={activeCategory}
			>
				<DialogHeader>
					<div className={styles.filterDialogTitle}>
						<span>
							<Icon aria-hidden="true" />
						</span>
						<div>
							<DialogTitle>{category.label} filters</DialogTitle>
							<DialogDescription>
								Refine your search with details specific to{" "}
								{category.shortLabel.toLowerCase()} before opening the listings.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className={styles.filterDialogBody}>
					<div
						className={styles.filterDialogIntro}
						data-category={activeCategory}
					>
						<strong>{getFilterDialogTitle(activeCategory)}</strong>
						<p>{getFilterDialogDescription(activeCategory)}</p>
					</div>

					<div className={styles.advancedGrid} data-category={activeCategory}>
						<CategorySearchFilters
							activeCategory={activeCategory}
							filters={filters}
							options={options}
							onFilterChange={onFilterChange}
						/>
						<PriceSlider
							maxBudget={category.maxBudget}
							selectedBudget={selectedBudget}
							hasBudgetFilter={hasBudgetFilter}
							onBudgetChange={onBudgetChange}
							onClear={onClearBudget}
						/>
					</div>
				</div>

				<DialogFooter className={styles.filterDialogFooter}>
					<Button type="button" variant="outline" onClick={onReset}>
						<Filter aria-hidden="true" />
						Reset filters
					</Button>
					<Button type="button" onClick={() => onOpenChange(false)}>
						<ArrowRight aria-hidden="true" />
						Apply filters
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function CategorySearchFilters({
	activeCategory,
	filters,
	options,
	onFilterChange,
}: {
	activeCategory: HomeSearchCategory;
	filters: HomeSearchFilters;
	options: ReturnType<typeof createOptionSets>;
	onFilterChange: <Key extends keyof HomeSearchFilters>(
		key: Key,
		value: HomeSearchFilters[Key],
	) => void;
}) {
	if (activeCategory === "cars") {
		return (
			<>
				<SearchSelect
					label="Transmission"
					value={filters.transmission}
					options={options.transmissions}
					placeholder="Any transmission"
					onChange={(value) => onFilterChange("transmission", value)}
				/>
				<SearchSelect
					label="Fuel type"
					value={filters.fuelType}
					options={options.fuelTypes}
					placeholder="Any fuel"
					onChange={(value) => onFilterChange("fuelType", value)}
				/>
				<SearchSelect
					label="Seats"
					value={filters.seats}
					options={options.seats}
					placeholder="Any seats"
					onChange={(value) => onFilterChange("seats", value)}
				/>
				<SearchSelect
					label="Year from"
					value={filters.minYear}
					options={options.years}
					placeholder="Any year"
					onChange={(value) => onFilterChange("minYear", value)}
				/>
			</>
		);
	}

	if (activeCategory === "apartments") {
		return (
			<>
				<SearchSelect
					label="Bedrooms"
					value={filters.bedrooms}
					options={options.bedrooms}
					placeholder="Any bedrooms"
					onChange={(value) => onFilterChange("bedrooms", value)}
				/>
				<SearchSelect
					label="Bathrooms"
					value={filters.bathrooms}
					options={options.bathrooms}
					placeholder="Any bathrooms"
					onChange={(value) => onFilterChange("bathrooms", value)}
				/>
			</>
		);
	}

	if (activeCategory === "hotel-rooms") {
		return (
			<>
				<SearchSelect
					label="Room type"
					value={filters.roomType}
					options={options.roomTypes}
					placeholder="Any room"
					onChange={(value) => onFilterChange("roomType", value)}
				/>
				<SearchSelect
					label="Bed type"
					value={filters.bedType}
					options={options.bedTypes}
					placeholder="Any bed"
					onChange={(value) => onFilterChange("bedType", value)}
				/>
			</>
		);
	}

	return (
		<>
			<SearchSelect
				label="Property type"
				value={filters.propertyType}
				options={options.propertyTypes}
				placeholder="Any home"
				onChange={(value) => onFilterChange("propertyType", value)}
			/>
			<SearchSelect
				label="Bedrooms"
				value={filters.bedrooms}
				options={options.bedrooms}
				placeholder="Any bedrooms"
				onChange={(value) => onFilterChange("bedrooms", value)}
			/>
			<SearchSelect
				label="Bathrooms"
				value={filters.bathrooms}
				options={options.bathrooms}
				placeholder="Any bathrooms"
				onChange={(value) => onFilterChange("bathrooms", value)}
			/>
		</>
	);
}

function SearchSelect({
	label,
	value,
	options,
	placeholder,
	onChange,
}: {
	label: string;
	value: string;
	options: SearchSelectOption[];
	placeholder: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className={styles.advancedField}>
			<span>{label}</span>
			<select value={value} onChange={(event) => onChange(event.target.value)}>
				<option value="">{placeholder}</option>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</label>
	);
}

function createOptionSets(
	listingOptions: ReturnType<typeof useListingOptions>["options"],
) {
	return {
		transmissions: toSearchOptions(listingOptions.cars.transmissions),
		fuelTypes: toSearchOptions(listingOptions.cars.fuelTypes),
		seats: numericOptionsToSearchOptions(listingOptions.cars.seats),
		years: listingOptions.years.map((year) => ({
			value: String(year),
			label: String(year),
		})),
		bedrooms: numericOptionsToSearchOptions(listingOptions.numbers.bedrooms),
		bathrooms: numericOptionsToSearchOptions(listingOptions.numbers.bathrooms),
		roomTypes: toSearchOptions(listingOptions.hotelRooms.roomTypes),
		bedTypes: toSearchOptions(listingOptions.hotelRooms.bedTypes),
		propertyTypes: toSearchOptions(listingOptions.airbnb.propertyTypes),
	};
}

function toSearchOptions<Value extends string>(
	options: ListingOption<Value>[],
): SearchSelectOption[] {
	return options.map((option) => ({
		value: option.value,
		label: option.label,
	}));
}

function numericOptionsToSearchOptions(
	options: NumericListingOption[],
): SearchSelectOption[] {
	return options.map((option) => ({
		value: String(option.value),
		label: option.label,
	}));
}

function PriceSlider({
	maxBudget,
	selectedBudget,
	hasBudgetFilter,
	onBudgetChange,
	onClear,
}: {
	maxBudget: number;
	selectedBudget: number;
	hasBudgetFilter: boolean;
	onBudgetChange: (value: number) => void;
	onClear: () => void;
}) {
	return (
		<div className={styles.priceField}>
			<div className={styles.priceHeader}>
				<span>
					<CircleDollarSign aria-hidden="true" />
					Max price
				</span>
				<strong>{formatBudgetLabel(selectedBudget, hasBudgetFilter)}</strong>
			</div>
			<input
				type="range"
				min={budgetStep}
				max={maxBudget}
				step={budgetStep}
				value={selectedBudget}
				className={styles.range}
				onChange={(event) => onBudgetChange(Number(event.target.value))}
				aria-label="Maximum listing price"
			/>
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
			<p className={styles.budgetHint}>
				{hasBudgetFilter
					? `Budget equivalent: ${formatUsdEquivalent(selectedBudget)} using the RWF buy rate. USD listings are filtered with the USD sell rate.`
					: "Set a RWF budget to filter both RWF and USD listings fairly."}
			</p>
			<button type="button" onClick={onClear}>
				Clear budget
			</button>
		</div>
	);
}

function DateRangeDialog({
	open,
	dateRange,
	onOpenChange,
	onDateRangeChange,
}: {
	open: boolean;
	dateRange: DateRange | undefined;
	onOpenChange: (open: boolean) => void;
	onDateRangeChange: (range: DateRange | undefined) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={styles.dateDialog}>
				<DialogHeader>
					<DialogTitle>Choose travel dates</DialogTitle>
					<DialogDescription>
						Select a start and end date. These dates will travel with your
						search.
					</DialogDescription>
				</DialogHeader>

				<div className={styles.datePreview}>
					<div>
						<span>Start</span>
						<strong>
							{dateRange?.from
								? format(dateRange.from, "MMM d, yyyy")
								: "Add date"}
						</strong>
					</div>
					<div>
						<span>End</span>
						<strong>
							{dateRange?.to ? format(dateRange.to, "MMM d, yyyy") : "Add date"}
						</strong>
					</div>
				</div>

				<div className={styles.calendarShell}>
					<Calendar
						mode="range"
						numberOfMonths={2}
						selected={dateRange}
						onSelect={onDateRangeChange}
						disabled={{ before: today }}
						showOutsideDays={false}
						className={styles.calendar}
					/>
				</div>

				<DialogFooter className={styles.dateDialogFooter}>
					<Button
						type="button"
						variant="outline"
						onClick={() => onDateRangeChange(defaultDateRange)}
					>
						<CalendarDays aria-hidden="true" />
						Reset dates
					</Button>
					<Button type="button" onClick={() => onOpenChange(false)}>
						<ArrowRight aria-hidden="true" />
						Use dates
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function formatDateRange(range: DateRange | undefined): string {
	if (!range?.from) {
		return "Add dates";
	}

	if (!range.to) {
		return format(range.from, "MMM d");
	}

	return `${format(range.from, "MMM d")} - ${format(range.to, "MMM d")}`;
}

function appendCategoryFilters(
	params: URLSearchParams,
	category: HomeSearchCategory,
	filters: HomeSearchFilters,
) {
	appendParam(params, "maxPrice", filters.maxPrice);

	if (category === "cars") {
		appendParam(params, "transmission", filters.transmission);
		appendParam(params, "fuelType", filters.fuelType);
		appendParam(params, "seats", filters.seats);
		appendParam(params, "minYear", filters.minYear);
		return;
	}

	if (category === "apartments") {
		appendParam(params, "bedrooms", filters.bedrooms);
		appendParam(params, "bathrooms", filters.bathrooms);
		return;
	}

	if (category === "hotel-rooms") {
		appendParam(params, "roomType", filters.roomType);
		appendParam(params, "bedType", filters.bedType);
		return;
	}

	if (category === "airbnb") {
		appendParam(params, "propertyType", filters.propertyType);
		appendParam(params, "bedrooms", filters.bedrooms);
		appendParam(params, "bathrooms", filters.bathrooms);
	}
}

function appendParam(params: URLSearchParams, key: string, value: string) {
	const normalizedValue = value.trim();

	if (normalizedValue) {
		params.set(key, normalizedValue);
	}
}

function formatBudgetLabel(value: number, hasBudgetFilter: boolean) {
	if (!hasBudgetFilter) {
		return "Any price";
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

function countActiveFilters(filters: HomeSearchFilters) {
	return Object.values(filters).filter((value) => value.trim()).length;
}

function getFilterDialogTitle(category: HomeSearchCategory) {
	if (category === "cars") {
		return "Vehicle requirements";
	}

	if (category === "apartments") {
		return "Apartment space";
	}

	if (category === "hotel-rooms") {
		return "Room setup";
	}

	return "Stay preferences";
}

function getFilterDialogDescription(category: HomeSearchCategory) {
	if (category === "cars") {
		return "Match transmission, fuel, seats, and year before comparing rental options.";
	}

	if (category === "apartments") {
		return "Set the room count that fits the people staying with you.";
	}

	if (category === "hotel-rooms") {
		return "Choose the room and bed format before viewing available hotels.";
	}

	return "Focus the search around the type of home and space you want.";
}
