"use client";

import type { ReactNode } from "react";
import {
	Bath,
	BedDouble,
	CircleDollarSign,
	Heart,
	House,
	KeyRound,
	MapPin,
	PawPrint,
	RefreshCcw,
	Search,
	ShieldCheck,
	SlidersHorizontal,
	Users,
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
import { Switch } from "@/components/ui/switch";
import type { ListingListRequest } from "@/services/api/listings";
import type { ListingSidebarRenderProps } from "./category-listings-page";
import styles from "./airbnb-listings-sidebar.module.css";

const countries = ["Rwanda", "Kenya", "Uganda", "Tanzania", "Burundi"];
const propertyTypes = ["House", "Villa", "Apartment", "Studio", "Guesthouse"];
const bedroomOptions = [1, 2, 3, 4, 5];
const bathroomOptions = [1, 2, 3, 4];
const guestOptions = [1, 2, 4, 6, 8, 10, 12];
const maxBudget = 1200000;
const budgetStep = 10000;

export function AirbnbListingsSidebar({
	categoryLabel,
	draftFilters,
	setDraftFilter,
	applyFilters,
	resetFilters,
}: ListingSidebarRenderProps) {
	const selectedBudget =
		typeof draftFilters.maxPrice === "number"
			? draftFilters.maxPrice
			: maxBudget;
	const hasBudgetFilter = typeof draftFilters.maxPrice === "number";

	return (
		<aside className={styles.sidebar} aria-label={`${categoryLabel} filters`}>
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

			<div className={styles.section}>
				<div className={styles.sectionTitle}>
					<Search aria-hidden="true" />
					<span>Home type</span>
				</div>
				<Select
					value={selectValue(draftFilters.propertyType)}
					onValueChange={(value) =>
						setDraftFilter("propertyType", optionalText(value))
					}
				>
					<SelectTrigger className={styles.selectTrigger}>
						<SelectValue>Property type</SelectValue>
					</SelectTrigger>
					<SelectContent align="start" alignItemWithTrigger={false}>
						<SelectItem value="ANY">Any property type</SelectItem>
						{propertyTypes.map((propertyType) => (
							<SelectItem key={propertyType} value={propertyType}>
								{propertyType}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Input
					type="text"
					value={textValue(draftFilters.amenity)}
					placeholder="Amenity, e.g. pool"
					onChange={(event) => setDraftFilter("amenity", event.target.value)}
				/>
			</div>

			<div className={styles.section}>
				<div className={styles.sectionTitle}>
					<BedDouble aria-hidden="true" />
					<span>Space</span>
				</div>
				<div className={styles.compactGrid}>
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
							{bedroomOptions.map((bedrooms) => (
								<SelectItem key={bedrooms} value={String(bedrooms)}>
									{bedrooms}+ beds
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
							{bathroomOptions.map((bathrooms) => (
								<SelectItem key={bathrooms} value={String(bathrooms)}>
									{bathrooms}+ baths
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
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
						{guestOptions.map((guests) => (
							<SelectItem key={guests} value={String(guests)}>
								{guests}+ guests
							</SelectItem>
						))}
					</SelectContent>
				</Select>
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
							{hasBudgetFilter ? formatBudget(selectedBudget) : "Any budget"}
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
					<button
						type="button"
						className={styles.clearBudget}
						onClick={() => setDraftFilter("maxPrice", undefined)}
					>
						Clear budget
					</button>
				</div>
			</div>

			<div className={styles.section}>
				<div className={styles.sectionTitle}>
					<ShieldCheck aria-hidden="true" />
					<span>Stay preferences</span>
				</div>
				<SwitchRow
					icon={<House aria-hidden="true" />}
					label="Entire place"
					description="Only show homes where guests get the full place."
					checked={draftFilters.entirePlace === true}
					onCheckedChange={(checked) =>
						setDraftFilter("entirePlace", checked ? true : undefined)
					}
				/>
				<SwitchRow
					icon={<KeyRound aria-hidden="true" />}
					label="Self check-in"
					description="Show stays that support independent arrival."
					checked={draftFilters.selfCheckIn === true}
					onCheckedChange={(checked) =>
						setDraftFilter("selfCheckIn", checked ? true : undefined)
					}
				/>
				<SwitchRow
					icon={<PawPrint aria-hidden="true" />}
					label="Pets allowed"
					description="Only include homes that allow pets."
					checked={draftFilters.allowPets === true}
					onCheckedChange={(checked) =>
						setDraftFilter("allowPets", checked ? true : undefined)
					}
				/>
			</div>

			<div className={styles.summary}>
				<span>
					<Heart aria-hidden="true" />
					Home rules
				</span>
				<span>
					<Bath aria-hidden="true" />
					Bathrooms
				</span>
				<span>
					<Users aria-hidden="true" />
					Guests
				</span>
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

function SwitchRow({
	icon,
	label,
	description,
	checked,
	onCheckedChange,
}: {
	icon: ReactNode;
	label: string;
	description: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}) {
	return (
		<label className={styles.switchRow}>
			<span className={styles.switchIcon}>{icon}</span>
			<span>
				<strong>{label}</strong>
				<small>{description}</small>
			</span>
			<Switch
				checked={checked}
				onCheckedChange={onCheckedChange}
				className={styles.switch}
			/>
		</label>
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

function formatBudget(value: number) {
	return new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 0,
	}).format(value);
}
