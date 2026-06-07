"use client";

import { useMemo, useState } from "react";
import {
	Check,
	ChevronDown,
	PackageCheck,
	Search,
	Sparkles,
	X,
} from "lucide-react";
import type {
	ListingAmenityOption,
	ListingOptionProductCategory,
} from "@/services/api/listing-options";
import styles from "./listing-popular-amenity-filter.module.css";

type ListingPopularAmenityFilterProps = {
	category: ListingOptionProductCategory;
	amenities?: Partial<
		Record<ListingOptionProductCategory, ListingAmenityOption[]>
	>;
	value?: string;
	onChange: (value: string | undefined) => void;
};

type AmenityGroup = {
	name: string;
	items: ListingAmenityOption[];
};

export function ListingPopularAmenityFilter({
	category,
	amenities,
	value,
	onChange,
}: ListingPopularAmenityFilterProps) {
	const [search, setSearch] = useState("");
	const [isExpanded, setIsExpanded] = useState(false);
	const selectedAmenities = useMemo(() => parseSelectedAmenities(value), [value]);
	const categoryAmenities = useMemo(
		() => sortAmenities(amenities?.[category] ?? []),
		[amenities, category],
	);
	const filteredAmenities = useMemo(
		() => filterAmenities(categoryAmenities, search),
		[categoryAmenities, search],
	);
	const amenityGroups = useMemo(
		() => groupAmenities(filteredAmenities),
		[filteredAmenities],
	);
	const selectedCount = selectedAmenities.length;
	const totalListingCount = categoryAmenities.reduce(
		(total, amenity) => total + (amenity.listingCount ?? 0),
		0,
	);
	const showsSearch = categoryAmenities.length > 8;
	const isLimited = !isExpanded && !search.trim();
	const visibleGroups = isLimited ? limitGroups(amenityGroups, 12) : amenityGroups;
	const visibleAmenityCount = visibleGroups.reduce(
		(total, group) => total + group.items.length,
		0,
	);

	if (!categoryAmenities.length) {
		return null;
	}

	function toggleAmenity(amenity: ListingAmenityOption) {
		const nextAmenities = new Set(selectedAmenities);

		if (nextAmenities.has(amenity.slug)) {
			nextAmenities.delete(amenity.slug);
		} else {
			nextAmenities.add(amenity.slug);
		}

		onChange(formatSelectedAmenities([...nextAmenities]));
	}

	function clearAmenity(amenitySlug: string) {
		const nextAmenities = selectedAmenities.filter((item) => item !== amenitySlug);
		onChange(formatSelectedAmenities(nextAmenities));
	}

	function clearAllAmenities() {
		setSearch("");
		onChange(undefined);
	}

	return (
		<section className={styles.filter} aria-label="Amenity filters">
			<header className={styles.header}>
				<div className={styles.heading}>
					<span className={styles.icon}>
						<PackageCheck aria-hidden="true" />
					</span>
					<div>
						<p>Amenities</p>
						<strong>
							{categoryAmenities.length} available
							{totalListingCount > 0
								? ` across ${formatCount(totalListingCount)} listings`
								: ""}
						</strong>
					</div>
				</div>
				{selectedCount > 0 ? (
					<button
						type="button"
						className={styles.clearButton}
						onClick={clearAllAmenities}
					>
						Clear
					</button>
				) : null}
			</header>

			{selectedCount > 0 ? (
				<div className={styles.selectedBar} aria-label="Selected amenities">
					<span>{selectedCount} selected</span>
					<div>
						{selectedAmenities.map((amenitySlug) => {
							const amenity = categoryAmenities.find(
								(item) => item.slug === amenitySlug,
							);

							return (
								<button
									key={amenitySlug}
									type="button"
									onClick={() => clearAmenity(amenitySlug)}
								>
									{amenity?.name ?? amenitySlug}
									<X aria-hidden="true" />
								</button>
							);
						})}
					</div>
				</div>
			) : null}

			{showsSearch ? (
				<label className={styles.searchField}>
					<Search aria-hidden="true" />
					<input
						type="search"
						value={search}
						placeholder="Search amenities"
						onChange={(event) => setSearch(event.target.value)}
					/>
				</label>
			) : null}

			{visibleGroups.length > 0 ? (
				<div className={styles.groups} data-expanded={isExpanded || Boolean(search)}>
					{visibleGroups.map((group) => (
						<div key={group.name} className={styles.group}>
							<div className={styles.groupHeader}>
								<span>{group.name}</span>
								<small>{group.items.length}</small>
							</div>
							<div className={styles.chips}>
								{group.items.map((amenity) => {
									const isSelected = selectedAmenities.includes(amenity.slug);

									return (
										<button
											key={amenity.id}
											type="button"
											data-selected={isSelected}
											onClick={() => toggleAmenity(amenity)}
										>
											<span className={styles.checkmark}>
												{isSelected ? (
													<Check aria-hidden="true" />
												) : amenity.isPopular ? (
													<Sparkles aria-hidden="true" />
												) : null}
											</span>
											<span>{amenity.name}</span>
											{amenity.listingCount ? (
												<small>{formatCount(amenity.listingCount)}</small>
											) : null}
										</button>
									);
								})}
							</div>
						</div>
					))}
				</div>
			) : (
				<p className={styles.empty}>No matching amenity is active yet.</p>
			)}

			{categoryAmenities.length > visibleAmenityCount && !search.trim() ? (
				<button
					type="button"
					className={styles.expandButton}
					data-expanded={isExpanded}
					onClick={() => setIsExpanded((current) => !current)}
				>
					{isExpanded
						? "Show fewer amenities"
						: `Show all ${categoryAmenities.length} amenities`}
					<ChevronDown aria-hidden="true" />
				</button>
			) : null}
		</section>
	);
}

function parseSelectedAmenities(value?: string) {
	return [
		...new Set(
			(value ?? "")
				.split(",")
				.map((item) => item.trim())
				.filter(Boolean),
		),
	];
}

function formatSelectedAmenities(values: string[]) {
	const normalizedValues = values.map((item) => item.trim()).filter(Boolean);

	return normalizedValues.length ? normalizedValues.join(",") : undefined;
}

function sortAmenities(amenities: ListingAmenityOption[]) {
	return [...amenities].sort((first, second) => {
		if (first.isPopular !== second.isPopular) {
			return first.isPopular ? -1 : 1;
		}

		if ((first.group ?? "") !== (second.group ?? "")) {
			return (first.group ?? "General").localeCompare(second.group ?? "General");
		}

		return first.sortOrder - second.sortOrder || first.name.localeCompare(second.name);
	});
}

function filterAmenities(amenities: ListingAmenityOption[], search: string) {
	const query = search.trim().toLowerCase();

	if (!query) {
		return amenities;
	}

	return amenities.filter((amenity) => {
		return [amenity.name, amenity.slug, amenity.group, amenity.description]
			.filter(Boolean)
			.some((value) => value?.toLowerCase().includes(query));
	});
}

function groupAmenities(amenities: ListingAmenityOption[]): AmenityGroup[] {
	const groups = new Map<string, ListingAmenityOption[]>();

	for (const amenity of amenities) {
		const group = amenity.group ?? "General";
		groups.set(group, [...(groups.get(group) ?? []), amenity]);
	}

	return [...groups.entries()].map(([name, items]) => ({ name, items }));
}

function limitGroups(groups: AmenityGroup[], limit: number): AmenityGroup[] {
	let remaining = limit;
	const limitedGroups: AmenityGroup[] = [];

	for (const group of groups) {
		if (remaining <= 0) {
			break;
		}

		const items = group.items.slice(0, remaining);
		remaining -= items.length;

		if (items.length) {
			limitedGroups.push({ ...group, items });
		}
	}

	return limitedGroups;
}

function formatCount(count: number) {
	return new Intl.NumberFormat("en", {
		notation: count >= 1000 ? "compact" : "standard",
		maximumFractionDigits: 1,
	}).format(count);
}
