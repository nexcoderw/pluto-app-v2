"use client";

import { CheckCircle2 } from "lucide-react";
import type { ProductAmenity } from "@/services/api/products";
import styles from "./listing-amenities-section.module.css";

type ListingAmenitiesSectionProps = {
	amenities?: ProductAmenity[];
	title?: string;
	description?: string;
};

export function ListingAmenitiesSection({
	amenities,
	title = "Included amenities",
	description = "Customer-facing features selected by the verified partner.",
}: ListingAmenitiesSectionProps) {
	const groups = groupAmenities(amenities ?? []);

	if (!groups.length) {
		return null;
	}

	return (
		<section className={styles.section}>
			<header className={styles.header}>
				<span>
					<CheckCircle2 aria-hidden="true" />
					Amenities
				</span>
				<h2>{title}</h2>
				<p>{description}</p>
			</header>

			<div className={styles.groupList}>
				{groups.map((group) => (
					<div className={styles.group} key={group.name}>
						<strong>{group.name}</strong>
						<ul>
							{group.items.map((item) => (
								<li key={item.id}>
									<CheckCircle2 aria-hidden="true" />
									<span>{item.name}</span>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</section>
	);
}

function groupAmenities(amenities: ProductAmenity[]) {
	const groups = new Map<string, ProductAmenity["amenity"][]>();

	for (const productAmenity of amenities) {
		const amenity = productAmenity.amenity;
		const group = amenity.group ?? "General";
		groups.set(group, [...(groups.get(group) ?? []), amenity]);
	}

	return Array.from(groups.entries())
		.map(([name, items]) => ({
			name,
			items: [...items].sort((first, second) => {
				if (first.sortOrder !== second.sortOrder) {
					return first.sortOrder - second.sortOrder;
				}

				return first.name.localeCompare(second.name);
			}),
		}))
		.sort((first, second) => first.name.localeCompare(second.name));
}
