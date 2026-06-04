import Image from "next/image";
import {
	CheckCircle2,
	KeyRound,
	Map,
	MessageSquare,
	SprayCan,
	Star,
	Tag,
} from "lucide-react";
import type { ListingReviewSummary } from "@/services/api/listing-reviews";
import styles from "./car-review-overview.module.css";

const reviewCategories = [
	{
		key: "cleanlinessRating",
		label: "Cleanliness",
		icon: SprayCan,
	},
	{
		key: "accuracyRating",
		label: "Accuracy",
		icon: CheckCircle2,
	},
	{
		key: "checkInRating",
		label: "Check-in",
		icon: KeyRound,
	},
	{
		key: "communicationRating",
		label: "Communication",
		icon: MessageSquare,
	},
	{
		key: "locationRating",
		label: "Location",
		icon: Map,
	},
	{
		key: "valueRating",
		label: "Value",
		icon: Tag,
	},
] as const;

export function CarReviewOverview({
	summary,
	isLoading,
	fallbackRating,
	fallbackCount,
	title = "What guests say about this car",
	titleId = "car-review-overview",
}: {
	summary?: ListingReviewSummary;
	isLoading: boolean;
	fallbackRating?: number | null;
	fallbackCount?: number;
	title?: string;
	titleId?: string;
}) {
	const reviewCount = summary?.total ?? fallbackCount ?? 0;
	const overallRating = summary?.overallRating ?? fallbackRating ?? null;
	const displayRating = overallRating ? overallRating.toFixed(1) : "New";

	return (
		<section className={styles.overview} aria-labelledby={titleId}>
			<div className={styles.heading}>
				<span>
					<Star aria-hidden="true" />
					Customer reviews
				</span>
				<h2 id={titleId}>{title}</h2>
			</div>

			<div className={styles.scoreHero}>
				<Image
					src="/icons/left-icon.avif"
					alt=""
					width={68}
					height={132}
					className={styles.laurel}
					aria-hidden="true"
				/>
				<strong>{isLoading ? "..." : displayRating}</strong>
				<Image
					src="/icons/right-icon.avif"
					alt=""
					width={68}
					height={132}
					className={styles.laurel}
					aria-hidden="true"
				/>
				<p>{reviewCount > 0 ? "Guest favorite" : "Awaiting first review"}</p>
				<small>
					{reviewCount > 0
						? `Based on ${reviewCount} verified customer review${
								reviewCount === 1 ? "" : "s"
							}.`
						: "Customer review scores will appear here after the first review."}
				</small>
			</div>

			<div className={styles.breakdown}>
				<div className={styles.overallBars}>
					<span>Overall rating</span>
					{[5, 4, 3, 2, 1].map((score) => (
						<div key={score}>
							<small>{score}</small>
							<i
								data-active={Boolean(overallRating && overallRating >= score)}
							/>
						</div>
					))}
				</div>

				{reviewCategories.map((category) => {
					const Icon = category.icon;
					const value = summary?.[category.key] ?? null;

					return (
						<div key={category.key} className={styles.categoryScore}>
							<span>{category.label}</span>
							<strong>{value ? value.toFixed(1) : "New"}</strong>
							<Icon aria-hidden="true" />
						</div>
					);
				})}
			</div>
		</section>
	);
}
