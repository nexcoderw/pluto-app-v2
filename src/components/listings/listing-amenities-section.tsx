"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
	const amenityCount = groups.reduce((total, group) => total + group.items.length, 0);

	if (!groups.length) {
		return (
			<section className={styles.section} data-empty="true">
				<div className={styles.emptyState}>
					<span>
						<ShieldCheck aria-hidden="true" />
					</span>
					<div>
						<strong>No amenities listed yet</strong>
						<p>
							This partner has not selected customer-facing amenities for this
							listing. You can still review the overview and booking details.
						</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className={styles.section}>
			<header className={styles.header}>
				<div>
					<span>
						Amenities
					</span>
					<h2>{title}</h2>
					<p>{description}</p>
				</div>
				<strong className={styles.countBadge}>
					{amenityCount} {amenityCount === 1 ? "amenity" : "amenities"}
				</strong>
			</header>

			<div className={styles.groupList}>
				{groups.map((group) => (
					<div className={styles.group} key={group.name}>
						<header>
							<span>
								<ShieldCheck aria-hidden="true" />
							</span>
							<div>
								<strong>{group.name}</strong>
								<small>
									{group.items.length}{" "}
									{group.items.length === 1 ? "feature" : "features"}
								</small>
							</div>
						</header>
						<div className={styles.badgeList}>
							{group.items.map((item) => (
								<Badge key={item.id} className={styles.amenityBadge}>
									<CheckCircle2 aria-hidden="true" />
									<span>{item.name}</span>
								</Badge>
							))}
						</div>
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
