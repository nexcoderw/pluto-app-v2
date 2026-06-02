"use client";

import type { ReactNode } from "react";
import {
	Bath,
	BedDouble,
	Building2,
	CircleDollarSign,
	MapPin,
	ParkingCircle,
	RefreshCcw,
	Search,
	ShieldCheck,
	SlidersHorizontal,
	Sofa,
	Users,
	Wifi,
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
import styles from "./apartment-listings-sidebar.module.css";

const countries = ["Rwanda", "Kenya", "Uganda", "Tanzania", "Burundi"];
const bedroomOptions = [1, 2, 3, 4, 5];
const bathroomOptions = [1, 2, 3, 4];
const guestOptions = [1, 2, 4, 6, 8, 10];
const maxBudget = 1000000;
const budgetStep = 10000;

export function ApartmentListingsSidebar({
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
					<Building2 aria-hidden="true" />
				</span>
				<div>
					<p>Apartment filters</p>
					<h2>Shape your stay</h2>
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
						aria-label="Maximum apartment listing price"
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
					<span>Essentials</span>
				</div>
				<SwitchRow
					icon={<Sofa aria-hidden="true" />}
					label="Furnished"
					description="Show apartments already prepared for living."
					checked={draftFilters.furnished === true}
					onCheckedChange={(checked) =>
						setDraftFilter("furnished", checked ? true : undefined)
					}
				/>
				<SwitchRow
					icon={<Wifi aria-hidden="true" />}
					label="WiFi"
					description="Only include apartments with WiFi listed."
					checked={draftFilters.wifi === true}
					onCheckedChange={(checked) =>
						setDraftFilter("wifi", checked ? true : undefined)
					}
				/>
				<SwitchRow
					icon={<ParkingCircle aria-hidden="true" />}
					label="Parking"
					description="Show apartments with parking available."
					checked={draftFilters.parking === true}
					onCheckedChange={(checked) =>
						setDraftFilter("parking", checked ? true : undefined)
					}
				/>
			</div>

			<div className={styles.summary}>
				<span>
					<BedDouble aria-hidden="true" />
					Bedrooms
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
