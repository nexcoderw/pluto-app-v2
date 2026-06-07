"use client";

import { CheckCircle2, Sparkles } from "lucide-react";
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

export function ListingPopularAmenityFilter({
	category,
	amenities,
	value,
	onChange,
}: ListingPopularAmenityFilterProps) {
	const popularAmenities = (amenities?.[category] ?? [])
		.filter((amenity) => amenity.isPopular)
		.slice(0, 12);

	if (!popularAmenities.length) {
		return null;
	}

	return (
		<section className={styles.filter} aria-label="Popular amenity filters">
			<header>
				<span>
					<Sparkles aria-hidden="true" />
					Popular amenities
				</span>
				{value ? (
					<button type="button" onClick={() => onChange(undefined)}>
						Clear
					</button>
				) : null}
			</header>

			<div className={styles.chips}>
				{popularAmenities.map((amenity) => {
					const isSelected = value === amenity.slug || value === amenity.name;

					return (
						<button
							key={amenity.id}
							type="button"
							data-selected={isSelected}
							onClick={() => onChange(isSelected ? undefined : amenity.slug)}
						>
							<CheckCircle2 aria-hidden="true" />
							<span>{amenity.name}</span>
						</button>
					);
				})}
			</div>
		</section>
	);
}
