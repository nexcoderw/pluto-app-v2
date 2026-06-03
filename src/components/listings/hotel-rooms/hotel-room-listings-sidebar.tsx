"use client";

import type { ReactNode } from "react";
import {
	BedDouble,
	CircleDollarSign,
	Coffee,
	DoorOpen,
	Hotel,
	MapPin,
	RefreshCcw,
	Search,
	ShieldCheck,
	ShowerHead,
	SlidersHorizontal,
	Snowflake,
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
import type { ListingSidebarRenderProps } from "../category-listings-page";
import styles from "./hotel-room-listings-sidebar.module.css";

const countries = ["Rwanda", "Kenya", "Uganda", "Tanzania", "Burundi"];
const roomTypes = ["Standard", "Deluxe", "Suite", "Executive", "Family"];
const bedTypes = ["Single", "Double", "Queen", "King", "Twin"];
const guestOptions = [1, 2, 3, 4, 6, 8];
const maxBudget = 900000;
const budgetStep = 10000;

export function HotelRoomListingsSidebar({
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
					<Hotel aria-hidden="true" />
				</span>
				<div>
					<p>Hotel room filters</p>
					<h2>Choose your room</h2>
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
					<span>Room setup</span>
				</div>
				<Select
					value={selectValue(draftFilters.roomType)}
					onValueChange={(value) =>
						setDraftFilter("roomType", optionalText(value))
					}
				>
					<SelectTrigger className={styles.selectTrigger}>
						<SelectValue>Room type</SelectValue>
					</SelectTrigger>
					<SelectContent align="start" alignItemWithTrigger={false}>
						<SelectItem value="ANY">Any room type</SelectItem>
						{roomTypes.map((roomType) => (
							<SelectItem key={roomType} value={roomType}>
								{roomType}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={selectValue(draftFilters.bedType)}
					onValueChange={(value) =>
						setDraftFilter("bedType", optionalText(value))
					}
				>
					<SelectTrigger className={styles.selectTrigger}>
						<SelectValue>Bed type</SelectValue>
					</SelectTrigger>
					<SelectContent align="start" alignItemWithTrigger={false}>
						<SelectItem value="ANY">Any bed type</SelectItem>
						{bedTypes.map((bedType) => (
							<SelectItem key={bedType} value={bedType}>
								{bedType}
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
						aria-label="Maximum hotel room listing price"
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
					<span>Room comforts</span>
				</div>
				<SwitchRow
					icon={<Coffee aria-hidden="true" />}
					label="Breakfast included"
					description="Only show rooms where breakfast is listed."
					checked={draftFilters.breakfastIncluded === true}
					onCheckedChange={(checked) =>
						setDraftFilter("breakfastIncluded", checked ? true : undefined)
					}
				/>
				<SwitchRow
					icon={<Snowflake aria-hidden="true" />}
					label="Air conditioning"
					description="Show rooms with cooling available."
					checked={draftFilters.hasAirConditioning === true}
					onCheckedChange={(checked) =>
						setDraftFilter("hasAirConditioning", checked ? true : undefined)
					}
				/>
				<SwitchRow
					icon={<ShowerHead aria-hidden="true" />}
					label="Private bathroom"
					description="Only include rooms with private bathrooms."
					checked={draftFilters.hasPrivateBathroom === true}
					onCheckedChange={(checked) =>
						setDraftFilter("hasPrivateBathroom", checked ? true : undefined)
					}
				/>
			</div>

			<div className={styles.summary}>
				<span>
					<DoorOpen aria-hidden="true" />
					Room type
				</span>
				<span>
					<BedDouble aria-hidden="true" />
					Bed type
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
